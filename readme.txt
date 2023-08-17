Instructions on running the YuGiOmni application:

    1) Open a terminal in Visual Studio Code in the directory you saved the folder. Results may vary if you are using a different editor, but the steps should be the same.

    2) In the terminal ->
        'npm install express' (In my tests this is the only one it explicitly asks for to be installed at least)
        If it insists you are still missing modules when you attempt to run it, 'npm install cors', 'npm install mysql', or whatever package it seems to be missing.

    3) After the setup, in the terminal 'node app.js'. This will start a localhost server at 127.0.0.1:3000 on your system, and this is what index.html will send API requests to in order to communicate with the database.

    4) Open index.html in your browser. This has primarily been tested with Google Chrome, so results may vary on different browsers.

    5) Navigate through the tabs and click the buttons in order to view the results of various queries.

Please contact mbauch72@uw.edu if you have any issues running the application.
