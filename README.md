## Eagle Eye Networks Video Exporter ##

Provide a valid username and password for your account along with the camera esn.  This will download all the video segments in flv format.

#### Step One ####
Install [Node.js](https://github.com/joyent/node.git) or [io.js](https://iojs.org/)

#### Step Two ####
    npm install

#### Step Three ####
Make a config file

    module.exports = {
        'username'   :  '',
        'password'   :  '',
        'camera'     :  ''
        // start and end time in EEN format
        // YYYYMMDDHHMMSS.sss
        'start_time' :  '20150120000000.000',
        'end_time'   :  '20150126000000.000'
    }

