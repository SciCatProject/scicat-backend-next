# How to create the test status table

- make sure that you have your database accessible and running on your local machine

- set up the basic working environment
  ```bash
  > EXPORT JWT_SECRET=`uuid`
  > EXPORT MONGODB_URI="mongodb://localhost:27017/scicat-nestjs-test"
  ```

- install all necessary npm packages
  ```bash
  > npm run install
  ```

- start SciCat backend 
  ```bash
  > npm run start
  ```

- in a second terminal run the tests and save results in temporary file
  ```bash
  > npm run test:api:mocha >>~/scicat-backend-nestjs-tests.txt 2>&1
  ```

- run awk script on results file
  ```bash
  > awk -f extract-table.awk scicat-backend-nestjs-tests.txt > tests-status.md
  ```

- commit and push new table
  ```bash
  > git add tests-status.md
  > git commit -m "your message here"
  > git push origin <your-branch>"
  ```

# Important
We are working to make this workflow automated.
Please stay tuned!!!

