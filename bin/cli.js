#!/usr/bin/env node
"use strict";

var boil = require("../lib/boil"),
    loadConfig = require("config-master"),
    path = require("path"),
    w = require("wodge"),
    mfs = require("more-fs"),
    Model = require("nature").Model;

var usage = "Usage: \nboil [options] <recipes>";

var argv = new Model()
    .define({ name: "help", alias: "h", type: "boolean" })
    .define({ name: "recipe", alias: "r", type: Array, defaultOption: true })
    .define({ name: "config", type: "boolean" })
    .define({ name: "helper", type: "string" })
    .define({ name: "template", alias: "t", type: "string" })
    .define({ name: "data", alias: "d", type: "string" })
    .set(process.argv);

if (argv.help) {
    console.log(usage);
    process.exit(0);
}

var config = loadConfig(
    path.join(w.getHomeDir(), ".boil.json"),
    path.join(process.cwd(), "boil.json"),
    path.join(process.cwd(), "package.json:boil")
);

var options = config.options || {};

if (argv.helper){
    boil.registerHelpers(argv.helper);    
}

if (argv.config){
    console.dir(config);
    process.exit(0);

} else if (argv.recipe && argv.recipe.length) {
    argv.recipe.forEach(function(recipeName){
        var recipe = config[recipeName];
        var mergedOptions = w.extend(options, recipe.options);
        boil.registerPartials(mergedOptions.partials);
        boil.registerHelpers(mergedOptions.helpers);
        console.log(boil.boil(config, recipeName));
    });

} else if (argv.template) {
    var data = argv.data 
        ? JSON.parse(mfs.read(argv.data))
        : {};
    console.log(boil.render(mfs.read(argv.template), data));
    
} else {
    console.log(usage);
}


// precompile templates and watch for changes to source files in boil.json
// boil(template, data) - make reactive.. if template or data, or source data files change, then re-run boil
/* 
handbrake puts data in a template, cli compiles templates to JS.

boil adds 

- rendering from cli (--template --data)
- a 'reactive data' layer.. the output is re-rendered if either template or data inputs change
- a means to store presets for boilerplating pages, components, src files etc. 

*/
