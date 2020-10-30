const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connection to mongoDB, neskor prepojit na Atlas

mongoose.connect("mongodb://localhost:27017/recipesDB", {useNewUrlParser: true, useUnifiedTopology: true});


const recipeSchema = {
  title: String,
  content: String,
  description: String,
  ingredients: [String]
};

const Recipe = mongoose.model("Recipe", recipeSchema);

var ingredients = [];


app.get("/", function(req, res) {

    res.render("home", {
      pageTitle: "Kuchársky denník",
      });
      ingredients.length = 0
});

app.get("/recipes", function(req,res) {
  Recipe.find({}, function(err, recipes) {
    res.render("recipes", {
      pageTitle: "Kuchársky denník",
      recipes: recipes
      });
  });
})

app.get("/compose", function(req, res) {

      res.render("compose", {
        pageTitle: "Pridaj nový recept",
        newIngredient: ingredients
      });

});

app.get("/recipe/:recipeId", function(req, res) {

  const requestedRecipeId = req.params.recipeId;

  Recipe.findOne({_id: requestedRecipeId}, function(err, recipes){

    res.render("recipe", {
      pageTitle: recipes.title,
      title: recipes.title,
      content: recipes.content,
      description: recipes.description,
      ingredients: recipes.ingredients
    });
  })

});


app.post("/saveIngredient", function(req, res) {

  if (!req.body.recipeIngredient == "") {
    const newIngredient = _.upperFirst(req.body.recipeIngredient);
    ingredients.push(newIngredient);
    res.redirect("/compose");
  } else {
    res.redirect("/compose")
  }

});

app.post("/compose", function(req, res) {

    const recipe = new Recipe ({
      title: _.upperFirst(req.body.recipeTitle),
      content: req.body.recipeBody,
      description: req.body.recipeDescription,
      ingredients: ingredients
    });
    ingredients.length = 0
    recipe.save(function(err) {
      if (!err) {
        res.redirect("/recipes");
      }
    });

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  ingredients = ingredients.filter(function(e) { return e !== checkedItemId })

  res.redirect("/compose");
})




// change port after deploying app on remote server
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
