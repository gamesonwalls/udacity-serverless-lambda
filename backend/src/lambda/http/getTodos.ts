import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'


// import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { getAllTodos } from '../../helpers/todos'

// TODO: Get all TODO items for a current user
export const handler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here

    const user_id = getUserId(event)
    const todos = await getAllTodos(user_id)
    todos.map(item => delete item['userId'])

    console.log("todos", todos)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: todos
      })
    }
  }

