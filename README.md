# Backend for pet-project "Agregator courses"

### Запустить проект
##### Запустить Docker 
```
docker-compose up -d
```
##### Запустить Nest.js 
```
npm run start:dev
```

### Готовые запросы
```
Create user
POST http://localhost:6000/api/v1/auth/sign-up
{
    "user": {
        "firstName": "Artem",
        "lastName": "Kumyshev",
        "login": "a.kumyshev",
        "email": "artemkumyshev@gmail.com",
        "password": ""
    }
}
```
```
Login user
POST  http://localhost:3999/api/v1/auth/sign-in
{
    "user": {
        "email": "artemkumyshev@gmail.com",
        "password": ""
    }
}
```
```
Get current user
GET http://localhost:6000/api/v1/user
Authorization: Bearer __TOKEN__
```