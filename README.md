# 1 Struture

Première partie du tutoriel.

Nous avons ici toute la structure de l'application, les base d'express, et les différents packages nécessaire d'installés.
Liste des packages :

* bcrypt `0.8.7` : *"Utilisé pour hasher le mot de passe de l'utilisateur avant de l’intégrer dans la base de donnée"*
* body-parser `1.15.2` : *"Permet la récupération des informations envoyé dans le body"*
* express `4.14.0` : *"Fournit les fonctionnalités web, dans notre cas un routeur"*
* express-jwt `5.1.0` : *"Middleware pour restreindre l'accès aux routes ayant la nécessité d'un token"*
* jsonwebtoken `7.1.9` : *"Permet la vérification et la validité d'un token"*
* mongoose `4.6.3` : *"ORM pour la connexion et l'utilisation de la base de donnée mongoDB"*

Pour suivre le tuto il vous faudra donc :
`NodeJS` installé et fonctionnel en version 6.8 minimum, attention, ne pas prendre la v7 qui est une version beta comme toute version impaire.
Une base de donnée `MongoDB` disponible.
Pour cela, vous pouvez soit :
Installer MongoDB depuis le site de MongoDB en fonction de votre distribution => https://www.mongodb.com/download-center?jmp=nav
Utiliser un container de MongoDB sur docker, c'est ce que j'utilise => https://hub.docker.com/_/mongo/
Utiliser l'offre gratuite de mongolab pour vos essaies : https://mlab.com/

Rendez-vous sur ma chaîne pour la présentation des tutos en vidéos.
https://www.youtube.com/c/Renouveaux_dev