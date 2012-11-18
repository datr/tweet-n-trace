tweet-n-trace
=============

Pull RMG track &amp; trace consignment numbers from tweets.

Installation
============
1. Clone the git repository
2. Create a heroku application:
     heroku create
3. Add MongoDB:
     heroku addons:add mongolab
4. Deploy your code:
     git push heroku master
5. Create a web dyno:
     heroku ps:scale web=1
6. Visit the application
     heroku open