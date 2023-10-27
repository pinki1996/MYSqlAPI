
//npm install express nodemon ejs

const database = require("mysql2/promise")
const Express = require("express")
const { compile } = require("ejs")
const app = Express()

app.set("view engine", "ejs")
app.use(Express.urlencoded())

 // connect the express appn to mysql --->npm install mysql2

 const connectionData = database.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database : "books_database"
})


app.get("/", function(req, res)
{
    res.render("home.ejs")
})

app.get("/create/books", async function(req, res)
{
    //Logic to get the author name and author id

    const authorsData = await connectionData.query("select * from authors")
    const output = authorsData[0]

    res.render("bookform.ejs",{ output : output})
})

app.post("/create/books", async function(req, res)
{
    //Logic to collect the title and description 
    // const myTitle = req.body.title
    // const myDescription = req.body.description

    const data = [req.body.title, req.body.description, req.body.id]

   
    await connectionData.query("insert into books(bookTitle, bookDescription, aid) values(?)",[data])
    res.redirect("/")
})


app.get("/create/authors", function(req, res)
{
    res.render("authorForm.ejs")
})

app.post("/create/authors", async function(req, res)
{
    const data = [req.body.authorname, req.body.authoremail]
    await connectionData.query("insert into authors(authorName, authorEmail) values(?)", [data])
    res.redirect("/")
})

app.get("/display/books", async function(req, res)
{
    //Logic to read all the books details present in the books tables

    const booksData = await connectionData.query("select * from books")
    const BooksData = booksData[0]
   

    const authorObj = {}

    for(let i of BooksData)
    {
        let id = i.aId
        // console.log(id)
      

        let authorNames = await connectionData.query("select authorName from authors where authorId = ?", id)
        let authorNameArray = authorNames[0]

        for(let i of authorNameArray)
        {
            authorObj["Author"+id] = i.authorName

        }
                
    }
        console.log(authorObj)
        res.render("booksdisplay.ejs", { books : BooksData, authorObj: authorObj })

  })

  app.get("/display/books/:id", async function(req, res)
  {
        let ID = req.params.id

        //get the particular book details using the id

       let particularBookData = await connectionData.query("select * from books where bookId = ?", [ID])
       let particularBookDataArray = particularBookData[0]

       res.render("particularBookDetails.ejs", { particularBook : particularBookDataArray})

  })

  app.get("/delete/books/:id", async function(req, res)
  {
    let ID = req.params.id
    await connectionData.query("delete from books where bookId = ?", [ID])
   res.render("deleteOneData.ejs")
  })

  app.get("/delete/books", async function(req, res)
  {
    //Logic to delete all the books

    await connectionData.query("delete  from books ")
    res.render("deleteAll.ejs")
  })

  app.get("/update/books/:id" , async function(req, res)
  {
    const ID = req.params.id
    const bookData = await connectionData.query("select * from books where bookId = ?", [ID])
    const bookDataArray = bookData[0]

    res.render("updateForm.ejs", { book : bookDataArray})

  })

  app.post("/update/books/:id", async function(req, res)
  {
    const ID = req.params.id
    const title = req.body.title
    const description = req.body.description

    await connectionData.query("update books set bookTitle = ?, bookdescription = ? where bookId = ?", [title, description, ID])

    res.redirect("/display/books")
  })

app.listen("3000")