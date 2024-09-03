# **REST API tempat penyimpanan gambar**

### **description**

    sebuah app / api yang bisa digunakan untuk menyimpan gambar dan melakukan operasi terhadap gambar yang tersimpan

### LIBRARY

1. express
2. morgan (untuk logging)
3. mongoose (untuk integrasi dengan mongodb)
4. multer (untuk upload gambar dan management gambar)
5. zod (untuk validasi query,data,parameter)
6. bcrypt (untuk hashing password)
7. chalk (membuat logging menjadi berwarna)
8. jsonwebtoken

### DATABASE

1. mongodb

### Fitur

- mendukung rest api request
- user authentication

### HTTP METHOD

- GET
- POST
- DELETE
- PATCH

### API [get] ENDPOINT

#### > /images/q?

      by_title=[TITLE] -> text title yang ada pada gamar
    & order_by=[ORDER_OPTION] -> date,title,size
    & limit=[Limit] -> jumlah gambar yang ingin di dapatkan
    & page=[PAGE] -> untuk pagination (jika limit tidak diberikan defaultnya adalah 3)

### /images

    [post] /upload

### > /user [all done]

     /signin [POST] data -> {username,password}
     /signup [POST] data -> {username,password,name,email}
     /update/ -> update the user profile
     /delete/ -> delete the user profile
     /profile -> get the current user profile

#### informasi mengenai user akan di simpan ke dalam cookie berupa jwt token
