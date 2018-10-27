# olympic-games
![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)

"Olympic-games" it's a test task from Brocoders for Node.js coders. 
Description [here](https://drive.google.com/open?id=1uCYBbpS4Q2mxIdoHazSnIoA-NZaTzN-cvyUgSJS_7Xw).

This task contain 2 stages: 
- import data from CSV file to SQLite database
- create cli-tool for build charts.

#### Project structure:
    .
    ├── charts/         # chart queries and builder
    ├── csv/            # csv file for import
    ├── db/             # sqlite db file
    ├── import/         # import to db scripts
    └── node_modules/
    ./import.js         # csv parse and import
    ./stat              # cli-tool for show charts

#### Prepare database:
```sh
$ node import.js
```

#### View cli-charts:
```sh
$ ./stat [chart] [params]
```
Command examples:
```sh
$ ./stat medals UKR summer gold
$ ./stat medals USA winter
$ ./stat top-teams 1998 winter silver
$ ./stat top-teams summer
```
