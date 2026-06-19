# MGLSI News

Application de gestion d'articles de presse — projet d'introduction à l'architecture logicielle.

## Présentation

L'application permet de consulter, créer et supprimer des articles classés par catégorie (Sport, Santé, Education, Politique). Elle est composée de trois couches :

- **Base de données** : MySQL (`mglsi_news`)
- **Backend** : API REST en Spring Boot (Java)
- **Frontend** : HTML / CSS / JavaScript (sans framework)

## Prérequis

- Java 17
- Maven (ou le wrapper `mvnw` fourni)
- MySQL (via MAMP ou installation classique), accessible sur le port `8889`
- Un navigateur récent

## Installation

### 1. Base de données

Importer le script SQL fourni (`mglsi_news.sql`) :

```bash
mysql -u root -p --port=8889 < mglsi_news.sql
```

Cela crée la base `mglsi_news`, les tables `Article` et `Categorie`, et insère des données de test.

### 2. Backend (Spring Boot)

Vérifier la configuration de connexion dans `src/main/resources/application.properties` :

```properties
spring.datasource.url=jdbc:mysql://localhost:8889/mglsi_news?useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=root
```

Lancer l'application :

```bash
./mvnw spring-boot:run
```

L'API démarre sur `http://localhost:8080`.

### 3. Frontend

Le frontend doit être servi par un serveur local (pas ouvert directement en `file://`, pour des raisons de CORS) :

```bash
cd frontend
python3 -m http.server 5500
```

Puis ouvrir dans le navigateur :

```
http://localhost:5500
```

## Endpoints de l'API

| Endpoint | Méthode | Description |
|---|---|---|
| `/categories` | GET | Liste toutes les catégories |
| `/categories/{id}` | GET | Récupère une catégorie |
| `/categories` | POST | Crée une catégorie |
| `/categories/{id}` | DELETE | Supprime une catégorie |
| `/articles` | GET | Liste tous les articles |
| `/articles/{id}` | GET | Récupère un article |
| `/articles` | POST | Crée un article |
| `/articles/{id}` | PUT | Modifie un article |
| `/articles/{id}` | DELETE | Supprime un article |

## Structure du projet

```
news/
├── frontend/              # Interface utilisateur (HTML/CSS/JS)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── src/main/java/com/mglsi/news/
│   ├── entity/             # Entités JPA (Article, Categorie)
│   ├── repository/         # Accès aux données (Spring Data JPA)
│   ├── controller/         # Endpoints REST
│   └── config/             # Configuration (CORS)
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

## Architecture de déploiement

En développement, tous les composants tournent sur la même machine :

- MySQL sur le port `8889` (via MAMP)
- API Spring Boot sur le port `8080`
- Frontend servi en local sur le port `5500`

Le frontend communique avec l'API en HTTP/JSON, et l'API communique avec la base de données via JDBC.
