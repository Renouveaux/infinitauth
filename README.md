# 2 Mongo

Dans cette seconde partie, nous allons créer notre modèle pour la base de donnée sous mongo.

Mais on ne s'arrête pas là.

On créer un champs virtuel : `isLocked` qui est une fonction nous donnant l'information si le compte utilisateur est blocké ou pas.
Le hash du mot de passe avant son enregistrement en base. Via la méthode `pre`.
La méthode `comparePassword` qui permet simplement de vérifier si le mot de passe saisie correspond à celui présent en base.
La méthode `incLoginAttempts` qui incrémente de 1 le champs `loginAttempts` à chaque erreur de l'utilisateur sur son mot de passe.
Une fonction `getAuthenticated` retourne si l'utilisateur est bien connecté.
Et enfin `getAccountInformation` qui retourne simplement les informations de l'utilisateur courant.

Rendez-vous sur ma chaîne pour la présentation des tutos en vidéos.
https://www.youtube.com/c/Renouveaux_dev