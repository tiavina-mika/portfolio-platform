Message persistant dans le flux de la page ; pour une confirmation passagère, utiliser `Toast`.

```jsx
<Alert variant="warning" title="Double authentification non activée" action={<Button size="sm" variant="outline">Activer</Button>}>
  Elle est obligatoire pour les rôles Administrateur à partir du 1er décembre.
</Alert>
<Alert variant="destructive" title="Le déploiement a échoué">La préproduction n'a pas répondu après 3 tentatives.</Alert>
```
