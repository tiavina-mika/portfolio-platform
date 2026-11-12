Confirmation passagère après une action ; disparaît après 5 s. Pour un message qui doit rester, utiliser `Alert`.

```jsx
<Toaster />   {/* une fois, à la racine */}
<Button onClick={() => Toaster.show({ variant: 'success', title: 'Invitation envoyée', description: 'marie@startup.eu recevra un email.' })}>Inviter</Button>
```

- `inverted` (encre) pour les confirmations neutres (« Modifications enregistrées »), avec action « Annuler » si possible.
- Titre au participe passé : « Article publié », « Rôle modifié ».
