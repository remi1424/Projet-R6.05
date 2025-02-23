# Projet Node

## Présentation du projet

Ce projet est une application Node.js utilisant une base de données pour gérer des utilisateurs. L'application permet de créer, lire, mettre à jour et supprimer des utilisateurs ainsi que des films avec les mêmes fonctionnalitées. Un service de notification est mis en place.
Ce service va permettre de recevoir un mail quand un utilisateur est créé, un film est ajouté et quand un film est modifié.

## Variables d'environnement

Pour que l'application fonctionne correctement, vous devez définir les variables d'environnement suivantes :

- `DB_HOST` : L'hôte de la base de données (`localhost`).
- `DB_PORT` : Le port de la base de données (`3306`).
- `DB_USER` : Le nom d'utilisateur de la base de données.
- `DB_PASSWORD` : Le mot de passe de la base de données.
- `DB_NAME` : Le nom de la base de données(`movies_db`).

## Installation

1. Clonez le dépôt :
    ```sh
    git clone https://github.com/remi1424/iut-project.git](https://github.com/remi1424/Projet-R6.05.git
    cd Projet-R6.05
    ```

2. Installez les dépendances :
    ```sh
    npm install
    ```

3. Configurez les variables d'environnement en créant un fichier `.env` à la racine du projet et en y ajoutant les variables d'environnement nécessaires :
    ```env
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=movies_db
    ```

4. Lancement du projet :
    ```sh
    docker run -d --name hapi-mysql -e MYSQL_ROOT_PASSWORD=hapi -e MYSQL_DATABASE=user mysql:8.0 --default-authentication-plugin=mysql_native_password
    npm start
   ```
   
## Exécution des migrations

Pour exécuter les migrations de base de données, utilisez la commande suivante :
```sh
npx knex migrate:latest
