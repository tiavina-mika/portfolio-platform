import { collections, HIGHEST_LEVEL_ROLES, USE_MASTER_KEY } from '@/constants/_core/constants';
import {
  ALWAYS_LOCKED_CLASSES,
  AUTHENTICATED_READABLE_CLASSES,
  CLP_CLASS_ALIASES,
  EXTRA_SCHEMA_FIELDS,
  FULL_ACCESS_OPERATIONS,
  OWNER_POINTER_FIELDS,
  ALWAYS_REBUILT_CLASSES,
  PUBLIC_READ_CLASSES,
  SELF_MANAGED_CLASSES,
} from '@/constants/_core/security.constants';

/**
 * Pure CLP-shape builder — no Parse.Schema/Parse.Query I/O — so the actual permission logic
 * (role scoping, `AUTHENTICATED_READABLE_CLASSES`, `OWNER_POINTER_FIELDS`) can be unit-tested
 * against plain objects instead of a real Parse Server, and safely against disposable class
 * names instead of production classes like `Notification`/`Rating`/`Request` that other
 * integration tests exercise concurrently.
 *
 * `roleRights`: plain `{ name, rights }` pairs (the shape of a `Parse.Role`'s `name`/`rights`),
 * already filtered/irrelevant-role-agnostic — every role is scanned for a `rights` entry
 * matching `sourceClassName`.
 *
 * CLP shape example:
 * {
 *   "find": { "role:MANAGER": true, "role:OWNER": true },
 *   "readUserFields": ["to"]
 * }
 */
export const buildCLPForClass = (
  className: string,
  sourceClassName: string,
  roleRights: { name: string; rights: any[] }[]
): Record<string, any> => {
  const clp: Record<string, any> = {};
  const ownerFields = OWNER_POINTER_FIELDS[className];

  /*
   * a role trusted enough to create/update this class is also trusted to introduce new columns
   * on it — Parse Server's `addField` CLP operation is otherwise master-key-only (see
   * `EXTRA_SCHEMA_FIELDS`), so without this every newly added form field would need a manual
   * schema pre-registration before the first BO save could ever write it. Deliberately NOT
   * mirrored from the `requiresAuthentication` grant below (owner-pointer classes like
   * Rating/Request that any signed-in end user, not just BO staff, is allowed to create) —
   * only actual role-based grants get schema-write access.
   */
  const grantAddField = (roleName: string): void => {
    if (!clp.addField) clp.addField = {};
    clp.addField[`role:${roleName}`] = true;
  };

  for (const role of roleRights) {
    const classEntry = role.rights.find((r) => r.className === sourceClassName);

    if (!classEntry) continue;

    for (const [operation, allowed] of Object.entries(classEntry.rights)) {
      if (!allowed) continue;

      /*
       * `destroy` is an app-level right (permanent/recycle-bin deletion, enforced by the
       * `destroyObjects`/`destroyUsers` Cloud Functions via `fromBO(..., ['destroy'], ...)`) —
       * it is not a Parse Server CLP operation. Writing it into the CLP makes `schema.setCLP()`
       * throw "destroy is not a valid operation for class level permissions".
       */
      if (operation === 'destroy') continue;

      if (!clp[operation]) clp[operation] = {};

      clp[operation][`role:${role.name}`] = true;

      if (operation === 'create' || operation === 'update') grantAddField(role.name);
    }
  }

  for (const operation of FULL_ACCESS_OPERATIONS) {
    if (!clp[operation]) clp[operation] = {};

    for (const roleName of HIGHEST_LEVEL_ROLES) {
      clp[operation][`role:${roleName}`] = true;

      if (operation === 'create' || operation === 'update') grantAddField(roleName);
    }

    if (['get', 'find'].includes(operation)) {
      if (PUBLIC_READ_CLASSES.includes(className)) {
        clp[operation]['*'] = true;
      }
      else if (AUTHENTICATED_READABLE_CLASSES.includes(className)) {
        clp[operation].requiresAuthentication = true;
      }
    }
    else if (SELF_MANAGED_CLASSES.includes(className)) {
      // sign-up happens before a session exists, everything else is the user editing their own row
      if (operation === 'create') clp[operation]['*'] = true;
      else clp[operation].requiresAuthentication = true;
    }
    else if (operation === 'create' && ownerFields?.authenticatedCreate) {
      clp[operation].requiresAuthentication = true;
    }
  }

  /*
   * `_User` gets no `writeUserFields` waiver on `addField` (no self-pointer column), so without
   * this every profile field added after the first rebuild would be rejected for a normal user.
   * Kept to signed-in callers: the columns sign-up itself writes are pre-created from
   * `EXTRA_SCHEMA_FIELDS` instead, so this never has to be opened to anonymous callers.
   */
  if (SELF_MANAGED_CLASSES.includes(className)) {
    if (!clp.addField) clp.addField = {};
    clp.addField.requiresAuthentication = true;
  }

  /*
   * `count` isn't a configurable per-role right (see `IRights` in the BO — only find/get/
   * create/update/delete/destroy), but Parse Server validates it as a CLP operation distinct
   * from `find` (`DatabaseController#find` does `op = count === true ? 'count' : op` before
   * calling `validatePermission`) — so a class whose `find` is public/role-scoped but whose
   * `count` was never touched keeps whatever restrictive value it had before this rebuild
   * system existed. Mirror `find` onto `count` so `.withCount()` queries never get a different
   * answer than the equivalent `.find()`.
   */
  clp.count = { ...clp.find };

  if (ownerFields) {
    if (ownerFields.read) clp.readUserFields = ownerFields.read;
    if (ownerFields.write) clp.writeUserFields = ownerFields.write;
  }

  return clp;
};

/**
 * Rebuilds the CLP for a single class by aggregating rights from every role
 * that has an entry for that class (or its alias, see `CLP_CLASS_ALIASES`), plus the
 * `AUTHENTICATED_READABLE_CLASSES` and `OWNER_POINTER_FIELDS` grants (see `buildCLPForClass`).
 * Overwrites any previous CLP for this class.
 */
export const rebuildCLPForClass = async (className: string): Promise<void> => {
  const sourceClassName = CLP_CLASS_ALIASES[className] ?? className;

  const roles = await new Parse.Query(Parse.Role)
    .equalTo('rights.className', sourceClassName)
    .find(USE_MASTER_KEY);

  const clp = buildCLPForClass(
    className,
    sourceClassName,
    roles.map((role) => ({ name: role.getName(), rights: role.get('rights') || [] }))
  );
  const ownerFields = OWNER_POINTER_FIELDS[className];

  /*
   * A fresh `Parse.Schema` instance per attempt: `.update()` empties its own `_fields`/`_indexes`
   * as a side effect even when the underlying REST call fails, so reusing the same instance for
   * the `.save()` fallback below would silently drop the pointer fields added here.
   */
  const buildSchema = (): Parse.Schema => {
    const schema = new Parse.Schema(className);

    const ownerPointerFields = new Set([...(ownerFields?.read ?? []), ...(ownerFields?.write ?? [])]);

    // pointer permissions require the field to already exist as a Pointer<_User> or Array column
    for (const field of ownerPointerFields) {
      if (ownerFields?.fieldTypes?.[field] === 'Array') {
        schema.addArray(field);
      } else {
        schema.addPointer(field, collections.User);
      }
    }

    for (const [field, type] of Object.entries(EXTRA_SCHEMA_FIELDS[className] ?? {})) {
      // already declared as an owner pointer above — adding it twice would conflict
      if (ownerPointerFields.has(field)) continue;

      if (type === 'Object') schema.addObject(field);
      else if (type === 'Date') schema.addDate(field);
      else if (type === 'Array') schema.addArray(field);
      else if (type === 'String') schema.addString(field);
      else if (type === 'Pointer') schema.addPointer(field, collections.User);
      else schema.addBoolean(field);
    }

    return schema.setCLP(clp);
  };

  try {
    await buildSchema().update();
  } catch (error) {
    // class has never been created yet (e.g. fresh local database) — create it instead
    if ((error as Parse.Error).code === Parse.Error.INVALID_CLASS_NAME) {
      await buildSchema().save();
    } else {
      throw error;
    }
  }
};

/**
 * Rebuilds CLP for a list of class names (deduped), also rebuilding any class
 * that is aliased to one of them (see `CLP_CLASS_ALIASES`).
 */
export const rebuildCLPForClasses = async (classNames: string[]): Promise<void> => {
  const unique = new Set(classNames);

  for (const [aliasClassName, sourceClassName] of Object.entries(CLP_CLASS_ALIASES)) {
    if (unique.has(sourceClassName)) unique.add(aliasClassName);
  }

  await Promise.all([...unique].map(rebuildCLPForClass));
};

/**
 * Rebuilds CLP for every class that appears in any role's rights array, plus every class
 * governed by `PUBLIC_READ_CLASSES`, `ALWAYS_REBUILT_CLASSES`, `CLP_CLASS_ALIASES` or
 * `OWNER_POINTER_FIELDS` (these must always have CLP/schema set up regardless of role
 * configuration — the first so public content classes like `Category`/`Article` stay
 * world-readable even when no role has ever been granted explicit rights on them, the second so
 * `Contact`/`Newsletter` lose the public `create` grant an existing database still carries and
 * have their columns pre-created on a new one, the third so the highest-level roles can access an
 * aliased class even before any role has an explicit rights entry, the fourth so owner pointer
 * permissions apply to privacy-sensitive classes like `Rating`/`UserSession` that have no
 * role-rights entry at all — see docs/OPTIMIZATION.md §10.2).
 *
 * `Ride`/`Vehicle` are force-rebuilt too, since they are now `OWNER_POINTER_FIELDS` entries —
 * the owner-pointer + `authenticatedCreate` grants are precisely what keeps a driver able to
 * publish and edit their own ride once a BO role gains rights on the class. `_User` is the one
 * `AUTHENTICATED_READABLE_CLASSES` member left out: its CLP is only rebuilt when a role already
 * references it, so a database whose `_User` schema has never been touched keeps Parse's default
 * open permissions instead of newly requiring authentication on every user read (blog author
 * lookups from the public website, for one).
 *
 * Called on server startup to keep CLP in sync with the stored role configuration.
 */
export const rebuildAllCLP = async (): Promise<void> => {
  const roles = await new Parse.Query(Parse.Role).find(USE_MASTER_KEY);

  const classNames = new Set<string>([
    ...PUBLIC_READ_CLASSES,
    ...ALWAYS_REBUILT_CLASSES,
    ...Object.values(CLP_CLASS_ALIASES),
    ...Object.keys(OWNER_POINTER_FIELDS),
    ...ALWAYS_LOCKED_CLASSES,
  ]);

  for (const role of roles) {
    const rights: any[] = role.get('rights') || [];

    for (const right of rights) {
      if (right.className) classNames.add(right.className);
    }
  }

  await rebuildCLPForClasses([...classNames]);
};
