var   express       = require('express');
var   bodyParser    = require('body-parser')
var   cors          = require('cors');
var   config        = require("config");

const C_AREA        = require('../common_area');

const HTTP_PORT     = config.get('http.port');

class WebIndex  {

    constructor() {

        this.app = express();
        this.app.set('view engine', 'ejs');
        this.app.engine('html', require('ejs').renderFile );
        this.app.use(cors());
        this.app.use(bodyParser.json());

        this.userApp    = require('./user_api'  )();        //단일현장 사용자기능 + 모바일
        this.adminApp   = require('./admin_api' )();        //단일현장 관리자기능 + 모바일
        this.centerApp  = require('./center_api')();        //Center용


        this.app.use("/rest",  this.userApp  );
        this.app.use("/rest/admin",  this.adminApp  );
        this.app.use("/rest/center",  this.centerApp  );
        this.app.use("/", express.static(__dirname + '/mobile'));


        this.server = this.app.listen(HTTP_PORT, () => {
            console.info("Web App listening at %s", HTTP_PORT)
        });
    }

}


module.exports = new WebIndex();