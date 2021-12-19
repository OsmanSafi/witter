const express = require("express");
const session = require('express-session');
const twitter = require("twitter");
const SpotifyWebApi = require('spotify-web-api-node');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
const pool = dbConnection();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true})); // Needed to get values from form using POST method

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'secret_key!',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

const user = new twitter({
  consumer_key: "YIxNYOJwnV2b14FbS8NgZUIQ2",
  consumer_secret: "00VsfIn7j9DhShqvzLR4j0IrD31JvymlV8U0UuvK17G3B5ccj0",
  access_token_key: "1258097264666394625-8GKflyse0HeS9dL4WsmV3gFv1j2n3F",
  access_token_secret: "xNuOgd5WdB30Qbz6nYCvEdQQXaCDfTCaiVSaw00SJVGqI"
})

 
////////////// routes //////////////////
app.get('/', (req, res) => {
   res.render('login')
});

app.post('/', async (req, res) => {
  let username = req.body.username;
  let sql = `SELECT *
             FROM users
             WHERE username = ?`;
  let data = await executeSQL(sql, [username]);

  if (data.length == 0) {
    res.render('login', {"error":"User not found"});
    return;
  }
  let userid = data[0].userid;
  let password = req.body.pwd;
  let passwordHash = data[0].password;
  const matchPassword = await bcrypt.compare(password, passwordHash);

  if (matchPassword){
    req.session.loggedin = true;
    req.session.userid = userid;
    res.redirect('/home');
  } else {
    res.render('login', {"error":"Invalid credentials"});
  }
});

app.get('/logout', (req, res) => {
  req.session.authenticated = false;
  req.session.destroy();
  // authenticated = false;
  res.redirect('/');
});


app.get('/home', async (req, res) => {
  //spotify
  var spotifyApi = new SpotifyWebApi({
    clientId: "21f1e3fbdba44a18a9bf27f795046bab",
    clientSecret: "d3c1b8fcd9454347975d5e499ebcd978"
  });
  await spotifyApi.clientCredentialsGrant().then(
    function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
      console.log('Something went wrong when retrieving an access token');
    }
  );
  let playlist = "";
  await spotifyApi.getPlaylist('3tzUBAtXvpMOcOjiKRzi6F').then(
    function(data) {
    playlist = data.body.id;
  }, function(err) {
    console.log('Something went wrong! HERE');
  });

  //twitter
  let tweets = '';
  var params = {
    id: '23424977' // 23424977 USA or 1 for WorldWide
  }

  // get 10 newest weets
  tweets = await user.get('trends/place', params);
  let sql = `SELECT *
             FROM users
             NATURAL JOIN weets
             ORDER BY time_stamp DESC`;
  let weets = await executeSQL(sql);
  // console.log(weets);

  res.render('home', {'twits': tweets, "music":playlist, "weets":weets})
});

app.post('/home', isLoggedIn, async (req, res) => {
  let weet = req.body.weet;
  let userid = req.session.userid;
  
  let sql = `INSERT INTO weets (userid, weet)
             values (?, ?)`
  executeSQL(sql, [userid, weet]);
  //console.log(weet);
  res.redirect('/home');
});


app.get('/profile', isLoggedIn, async (req, res) => {
  let userid = -1;
  if (req.query.userid == null) {
    userid = req.session.userid;
  } else {
    userid = req.query.userid;
  }

  //spotify
  var spotifyApi = new SpotifyWebApi({
    clientId: "21f1e3fbdba44a18a9bf27f795046bab",
    clientSecret: "d3c1b8fcd9454347975d5e499ebcd978"
  });
  await spotifyApi.clientCredentialsGrant().then(
    function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
      console.log('Something went wrong when retrieving an access token');
    }
  );
  let playlist = "";
  await spotifyApi.getPlaylist('3tzUBAtXvpMOcOjiKRzi6F').then(
    function(data) {
    playlist = data.body.id;
  }, function(err) {
    console.log('Something went wrong! HERE');
  });

  //twitter
  let tweets = '';
  var params = {
    id: '23424977' // 23424977 USA or 1 for WorldWide
  }
  tweets = await user.get('trends/place', params);

  let sql = `SELECT *
             FROM users
             WHERE userid=?`;
  let data = await executeSQL(sql, [userid]);

  sql = `SELECT f.followed, fu.username
         FROM users as u JOIN follow_list as f join users as fu on f.followed=fu.userid
         WHERE u.userid=? and u.userid=f.followerid`
  let follow_list = await executeSQL(sql, [userid]);
  // console.log(data);
  let sql2 = `SELECT weetid, weet, time_stamp
             FROM weets
             WHERE userid=?
             ORDER BY time_stamp DESC
             LIMIT 20`;
  let weets2 = await executeSQL(sql2, [userid]);

  if (weets2 == null) {
    res.redirect('/home')
  }

  // console.log(weets2);

  // send true if profile is followed by user
  let userFollowed = false;
  if (userid != req.session.userid) {
    let sqql = `SELECT 1
                FROM follow_list
                WHERE followed=? and followerid=?`
    let followed = await executeSQL(sqql, [userid, req.session.userid]);
    if (followed.length == 1) userFollowed = true;
  }
  
  res.render('profile', {'twits': tweets, "music":playlist, "data": data, 'follow_list': follow_list, "weets":weets2, "userFollowed": userFollowed})
});


async function fetchData(url){
  let response = await fetch(url);
  let data = await response.json();
  return data;
}


app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  let email = req.body.email;
  let username = req.body.username;
  let displayname = req.body.name;
  let sex = req.body.userSex;
  
  let sql = `SELECT *
             FROM users
             WHERE username = ? or email = ?`;
  let data = await executeSQL(sql, [username, email]);

  if (data.length != 0) {
    res.render('signup', {"error":"User already exists"});
    return;
  }

  let password = req.body.pwd;
  let picture = "https://i.imgur.com/nTxJseA.jpg";
  bcrypt.hash(password, saltRounds, function(err, hash) {
    sql = `INSERT INTO users (email, picture, username, displayname, sex, password)
          VALUES (?, ?, ?, ?, ?, ?)`;
    executeSQL(sql, [email, picture, username, displayname, sex, hash]);
  });
  res.redirect('/');
});


app.get('/settings', isLoggedIn, async (req, res) => {
  //spotify
  var spotifyApi = new SpotifyWebApi({
    clientId: "21f1e3fbdba44a18a9bf27f795046bab",
    clientSecret: "d3c1b8fcd9454347975d5e499ebcd978"
  });
  await spotifyApi.clientCredentialsGrant().then(
    function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
      console.log('Something went wrong when retrieving an access token');
    }
  );
  let playlist = "";
  await spotifyApi.getPlaylist('3tzUBAtXvpMOcOjiKRzi6F').then(
    function(data) {
    playlist = data.body.id;
  }, function(err) {
    console.log('Something went wrong! HERE');
  });

  //twitter
  let tweets = '';
  var params = {
    id: '23424977' // 23424977 USA or 1 for WorldWide
  }
  tweets = await user.get('trends/place', params);

  let userid = -1;
  if (req.query.userid == null) {
    userid = req.session.userid;
  } else {
    userid = req.query.userid;
  }
  
  //userid = req.session.userid
  let sql = `SELECT *
             FROM users
             WHERE userid=?`;
  let data = await executeSQL(sql, [userid]);

  
  res.render('settings', {'twits': tweets, "music":playlist, "data":data})
  
  // res.render('settings', {"data":data});
});

app.post('/settings', isLoggedIn, async (req, res) => {
  let userid = req.session.userid;
  let displayName = req.body.displayName;
  let email = req.body.email;
  let userName = req.body.userName;
  let sex = req.body.userSex;

  //update the user in database
  let sql = `UPDATE users SET
             email = ?,
             username = ?,
             displayname = ?,
             sex = ?
             WHERE userid = ?`;
  executeSQL(sql, [email, userName, displayName, sex, userid]);

  res.redirect('/home');
});


app.post('/passwordChange', isLoggedIn, async (req, res) => {
  let userid = req.session.userid;
  let password = req.body.password;

  let newpass;
  let saltRounds = 10;
  await bcrypt.hash(password, saltRounds).then(function(hash) {
    newpass = hash;
  });

  //update the user in database
  let sql = `UPDATE users SET
             password = ?
             WHERE userid = ?`;
  executeSQL(sql, [newpass, userid]);

  res.redirect('/home');
});


app.get("/api/email_available", async function(req, res){
  let email = req.query.email;
  let sql = `SELECT 1
            FROM users
            WHERE email=?`;
  let avail = await executeSQL(sql, [email]);
  res.send(avail.length == 0);
});

app.get("/api/username_available", async function(req, res){
  let username = req.query.username;
  let sql = `SELECT 1
            FROM users
            WHERE username=?`;
  let avail = await executeSQL(sql, [username]);
  res.send(avail.length == 0);
});

app.get("/api/get_user_weets", async function(req, res){
  let userid = req.query.userid;
  let sql = `SELECT weetid, weet, time_stamp
             FROM weets
             WHERE userid=?
             LIMIT 10`;
  let weets = await executeSQL(sql, [userid]);
  res.send(weets);
});


app.post('/follow', isLoggedIn, async (req, res) => {
  let followid = req.body.userid;
  let userid = req.session.userid;
  if (followid == userid) {
    res.status(204).send();
    return;
  }
  let sql=`INSERT INTO follow_list (followed, followerid)
           values (?, ?)`
  executeSQL(sql, [followid, userid]);
  let redirect = '/profile?userid=' + followid;
  res.redirect(redirect);
});

app.post('/unfollow', isLoggedIn, async (req, res) => {
  let unfollowid = req.body.userid;
  let userid = req.session.userid;
  if (unfollowid == userid) {
    res.status(204).send();
    return;
  }
  let sql=`DELETE FROM follow_list
           WHERE followed=? and followerid=?`
  executeSQL(sql, [unfollowid, userid]);
  let redirect = '/profile?userid=' + unfollowid;
  res.redirect(redirect);
});


app.get("/dbTest", async function(req, res){
let sql = "SELECT CURDATE()";
let rows = await executeSQL(sql);
res.send(rows);
});//dbTest

//functions
function isLoggedIn(req, res, next) {
  if (!req.session.loggedin) {
    res.redirect("/");
  } else {
    next();
  }
}

async function executeSQL(sql, params){
return new Promise (function (resolve, reject) {
pool.query(sql, params, function (err, rows, fields) {
if (err) throw err;
   resolve(rows);
});
});
}

//values in red must be updated
// https://csumb.space/db/
function dbConnection(){

   const pool  = mysql.createPool({

      connectionLimit: 10,
      host: "en1ehf30yom7txe7.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
      user: "y3tj40ujsjrvo2yv",
      password: "ekdjtd9udi884au1",
      database: "l0bdh4v4d0wm16d4"

   }); 

   return pool;

} //dbConnection
//start server
app.listen(3000, () => {
console.log("Expresss server running...")
} )

// username and passwords for users

// beyonce - beyoncepass
// kendrick lamar - kendrickpass
// aiden - aidenpass
// davids - mario
// obama - obamapass
// taylor - taylorpass
// Monte Rey - montepass
// drake - drakepass
// al - 
// kid - safi
// admin - secret
