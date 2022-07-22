import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createToDoItem } from '../../helpers/todos'

export const handler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    const user_id = getUserId(event)

    const itemCreated = await createToDoItem(newTodo, user_id)
    delete itemCreated['userId']

    return {

      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: itemCreated
      })
    }
  }


// handler.use(
//   cors({
//     credentials: true
//   })
// )
