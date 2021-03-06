# graphql-fullstack-tutorial

Each directory is a self-contained example application that demonstrates the usage of graphql. The idea was to start with a simple example of books with authors. A book can have one author, but an author can have many books. This structure is maintained throughout and each new directory slightly builds off the last one without creating a whole new schema which can be confusing for someone trying to learn graphql.

# 01 - 04

These are server side only, from the root you have to cd into the folder, run `npm install` and then `npm run devstart`. You will receive a link in the terminal specifying where to go to query the server.

Note: In the first lesson, there is a hard coded array of data stored in a variable. Later on you will need to go to mongodb atlas, and create a cluster. The link you get will need to be pasted in the .env file.

# 01 

To run the app, run this command from the terminal window from the root: 
```shell
cd 01_graphql-cursor && npm i && npm run devstart
```

# 02 

This is the same as 01, but shows how to use json server to make things a bit more realistic rather than using a variable

To run the app, run this command from the terminal window from the root: 
```shell
cd 02_graphql-cursor-json-server && npm i && npm run devstart
```

here are two basic queries based on this tutorials schema: 

![Screen Shot 2021-12-17 at 6 46 49 PM](https://user-images.githubusercontent.com/40828283/146586534-1a4d1166-35cb-475a-8a23-469fc12ee340.png)

![Screen Shot 2021-12-17 at 6 46 20 PM](https://user-images.githubusercontent.com/40828283/146586551-dbaa2e49-2f3e-4627-8229-61dd0e8f0721.png)





# 03

Instead of using the graphql server, now we switch over to apollo, this should showcase how much more convenient it is to define a schema and how much simpler it is to use nested resolvers.

To run the app, run this command from the terminal window from the root: 
```shell
cd 03_apollo-server && npm i && npm run devstart
```

![Screen Shot 2021-12-17 at 6 21 43 PM](https://user-images.githubusercontent.com/40828283/146583485-e4fd9b69-8297-44bf-96f8-006e9c0851f2.png)



# 03.1

This example gets rid of the code duplication to make the code DRY. The resolvers for books and authors now have had all of the code moved out into another function `cursorPagination`.

To run the app, run this command from the terminal window from the root: 
```shell
cd 03.1_apollo-server && npm i && npm run devstart
```



# 04

To make things a bit more realistic we will now switch over to using a database. You will need to go to mongodb atlas and create a cluster. From there you will need to paste this link in the .env file under the variable mongoDB


To run the app, run this command from the terminal window from the root: 
```shell
cd 04_graphql-mongodb && npm i && npm run devstart
```


# 05

To run the app, run these commands in two separate terminal windows from the root:
```shell
cd 05_fullstack/client && npm i && npm start
```
```shell
cd 05_fullstack/server && npm i && npm run devstart
```

Once you have done this from the browser, check the console, there is a piece of code in the index.js file that shows you what structure the data looks like from a query.

This app is using prisma, from this point on prisma is used to connect to our database instead of mongoose

# 06

This shows the basics of how to get a subscription up and running, if you run the app from two different browser windows, you will see that when an object is created, it is added to the other page without a reload.


To run the app, run these commands in two separate terminal windows from the root:
```shell
cd 06_fullstack/client && npm i && npm start
```
```shell
cd 06_fullstack/server && npm i && npm run devstart
```

Open a new window with apollo and run this code, you will see an indicator in the subscriptions pane that the server is listening. When you add a book with a mutation in the other tab you will see it is added to the subscription pane.

![Screen Shot 2021-11-21 at 12 46 24 PM](https://user-images.githubusercontent.com/40828283/146587256-209c654b-f111-4b41-a15c-fd5c2599d1c1.png)


# 07

Rather than using books with authors, here is a more realistic example using comments and posts. There is pagination on the posts, but also on the comments.
Open two browser windows, add a new post, and watch it appear on the other tab without refreshing the page.

From the project root you will need to create a `.env` file and put the url to your mongoDB atlas cluster there
```
DATABASE_URL="mongodb://USERNAME:PASSWORD@HOST/DATABASE"
DATABASE_URL="mongodb+srv://<name>:<password>@<clusterName>.leuwl.mongodb.net/<DatabaseName>?retryWrites=true&w=majority"
```

To run the app, run these commands in two separate terminal windows from the root:
```shell
cd 07_fullstack/client && npm i && npm start
```
```shell
cd 07_fullstack/server && npm i && npm run devstart

```

If you get a connection error, your `DATABASE_URL` could be wrong, if you correct it, make sure you run:
``` shell
npx prisma generate
```
and then once that finishes:
```shell
npm run devstart
```

### query for all of the comments on a single post

![Screen Shot 2021-12-17 at 6 42 45 PM](https://user-images.githubusercontent.com/40828283/146586016-1a01c171-d631-4f04-9161-3a71f63b4cae.png)


### query for multiple posts

![Screen Shot 2021-12-17 at 6 29 43 PM](https://user-images.githubusercontent.com/40828283/146585466-fcc748ec-2af9-4c71-b235-ec41024aa7e6.png)


