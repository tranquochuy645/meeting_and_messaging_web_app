import app from './app';
import { createServer } from 'http'
import { chatAppDbController as dc } from './controllers/mongodb'
import { setupSocketIO } from './controllers/socket';
import AWSControllerS3 from './controllers/amazonS3';
import conf from './config';
const port = conf.port || 443
const dbOpts = {}
dc.init(conf.mongo_uri, conf.db_name, dbOpts)
    .then(() => {
        // Only start server after db is initialized
        // AWSControllerS3.init(
        //     {
        //         aws_region: conf.aws_region,
        //         aws_accessKeyId: conf.aws_accessKeyId,
        //         aws_secretAccessKey: conf.aws_secretAccessKey
        //     }
        // )
        const server = createServer(app);
        setupSocketIO(server);

        server.listen(port);
    })
    .catch(
        err => console.error(err)
    );
