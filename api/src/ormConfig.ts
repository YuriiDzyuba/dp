import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
    //url: process.env.DATABASE_URL,
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'instagramuser',
    password: '8848',
    database: 'instagram',
    entities: [],
    synchronize: false,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    cli: {
        migrationsDir: 'src/migrations',
    },
};

export default config;
