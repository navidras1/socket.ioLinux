import dotenv from 'dotenv';
import amqp from "amqplib"
import { Common } from './Common.js';
import { RedisActions } from './RedisActions.js';
export class RabbitMqAction {
    

    static async PublishprivateChatLog(data) {


        dotenv.config();
        const rabbitMqUserName = process.env.RabbitMqUserName;
        const rabbitMqPassword = process.env.RabbitMqPassword;
        let queue = process.env.RabbitMqPrivateChatQueue;


        const opt = { credentials: amqp.credentials.plain(rabbitMqUserName, rabbitMqPassword) };
        let connection;
        try {
            connection = await amqp.connect(process.env.RabbitMqServerAddress, opt);
            const channel = await connection.createChannel();

            await channel.assertQueue(queue, { durable: false });
            
            //RedisActions.wait(200);

            await channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
            console.log(`${Common.DateNOW()} Sent to RabbitMq: ${JSON.stringify(data)}`);
            await channel.close();
        } catch (err) {
            console.log(`${Common.DateNOW()} RabbitMq Error ${err}`);
        } finally {
            if (connection) await connection.close();
        }


    }

    static async PublishChatRoomLog(data) {


        dotenv.config();
        const rabbitMqUserName = process.env.RabbitMqUserName;
        const rabbitMqPassword = process.env.RabbitMqPassword;
        let queue = process.env.RabbitMqChatRoomQueue;


        const opt = { credentials: amqp.credentials.plain(rabbitMqUserName, rabbitMqPassword) };
        let connection;
        try {
            connection = await amqp.connect(process.env.RabbitMqServerAddress, opt);
            const channel = await connection.createChannel();

            await channel.assertQueue(queue, { durable: false });
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
            console.log(`${Common.DateNOW()} Sent to RabbitMq: ${JSON.stringify(data)}`);
            await channel.close();
        } catch (err) {
            console.log( `${Common.DateNOW()} RabbitMq Error ${err}`);
        } finally {
            if (connection) await connection.close();
        }


    }


    static async PublishChatRoomMessageLog(data) {


        dotenv.config();
        const rabbitMqUserName = process.env.RabbitMqUserName;
        const rabbitMqPassword = process.env.RabbitMqPassword;
        let queue = process.env.RabbiMqChatMessageQueue;


        const opt = { credentials: amqp.credentials.plain(rabbitMqUserName, rabbitMqPassword) };
        let connection;
        try {
            connection = await amqp.connect(process.env.RabbitMqServerAddress, opt);
            const channel = await connection.createChannel();

            await channel.assertQueue(queue, { durable: false });
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
            console.log(`${Common.DateNOW()} Sent to RabbitMq: ${JSON.stringify(data)} Queue Name: ${queue}`);
            await channel.close();
        } catch (err) {
            console.log( `${Common.DateNOW()} RabbitMq Error ${err}`);
        } finally {
            if (connection) await connection.close();
        }


    }

    static async PublishGeneralLog(data){
        dotenv.config();
        const rabbitMqUserName = process.env.RabbitMqUserName;
        const rabbitMqPassword = process.env.RabbitMqPassword;
        let queue = process.env.RabbitMqGeneralLog;

        const opt = { credentials: amqp.credentials.plain(rabbitMqUserName, rabbitMqPassword) };
        let connection;
        try {
            connection = await amqp.connect(process.env.RabbiMqLogServerAddress, opt);
            const channel = await connection.createChannel();

            await channel.assertQueue(queue, { durable: false });
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
            console.log(`${Common.DateNOW()} Sent to Logger MicroService: ${JSON.stringify(data)}`);
            await channel.close();
        } catch (err) {
            console.log( `${Common.DateNOW()} Logger MicroService Error ${err}`);
        } finally {
            if (connection) await connection.close();
        }



    }
}