Modale pour une décision ou un formulaire court qui interrompt le flux ; jamais pour du contenu long.

```jsx
<Dialog open={open} onClose={() => setOpen(false)} title="Supprimer cet utilisateur ?"
  description="Il perdra l'accès au back-office immédiatement. Cette action est enregistrée dans le journal d'audit."
  footer={<><Button variant="outline" onClick={close}>Annuler</Button><Button variant="destructive">Supprimer</Button></>} />
```

- Pied : action principale à droite, annulation à sa gauche.
- Titre en question pour une confirmation ; verbe précis sur le bouton (« Supprimer », pas « OK »).
