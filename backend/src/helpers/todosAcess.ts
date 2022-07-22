import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
//import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';



AWSXRay.captureAWS(AWS)


//const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodoAccess {

    constructor(
        private docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        //private docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private s3 = new AWS.S3({ signatureVersion: 'v4' }),
        private table = process.env.TODOS_TABLE,
        private bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.table,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createToDoItem(item: TodoItem): Promise<TodoItem> {

        await this.docClient.put({
            TableName: this.table,
            Item: {
                ...item
            }
        }).promise()
        return item
    }

    async updateToDoItem(reqParams: TodoUpdate, userid: string, todoId: string): Promise<void> {
        await this.docClient.update({
            TableName: this.table,
            Key: {
                "userId": userid,
                "todoId": todoId
            },
            UpdateExpression: "SET #name=:name,dueDate=:dueDate,done=:done",
            ExpressionAttributeValues: {
                ":name": reqParams.name,
                ":dueDate": reqParams.dueDate,
                ":done": reqParams.done
            },
            ExpressionAttributeNames: {
                "#name": "name"
            }
        }).promise()
    }

    async deleteItem(userid: string, todoId: string): Promise<void> {
        await this.docClient.delete({
            TableName: this.table,
            Key: {
                "userId": userid,
                "todoId": todoId
            }
        }).promise()
    }

    async updateUrl(userid: string, todoId: string): Promise<void> {
        await this.docClient.update({
            TableName: this.table,
            Key: {
                "userId": userid,
                "todoId": todoId
            },
            UpdateExpression: "set attachmentUrl=:attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${todoId}`

            }
        }).promise()
    }

    async deleteTodoAttachment(bucketId: string): Promise<void> {
        await this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: bucketId
        }).promise()
    }

    async getSignedUrlS3Bucket(bucketKey: string): Promise<string> {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: bucketKey,
            Expires: parseInt(this.urlExpiration)
        })
    }



}
