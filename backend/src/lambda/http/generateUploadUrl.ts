import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'



import { getUserId } from '../utils'
import { generateUploadUrl } from '../../helpers/attachmentUtils'

export const handler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const user_id = getUserId(event)

    const img_url = await generateUploadUrl(user_id, todoId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl: img_url
      })
    }
  }


