import psycopg2 
import postgresql
import boto3 
import logging 
import json 

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def addWord(cur, values):
    cmd = """
    INSERT INTO spellchecker
    VALUES """
    #param_values = []
    for value in values: 
        cmd += "(%s),"
        #param_values.extend(value)
    cmd = cmd[:-1]
    cmd += " RETURNING word"
    cur.execute(cmd, values)
    return cur.fetchall()

def updateWord(cur, id, value):
    cmd = """
    UPDATE spellchecker set word = %s
    where word = %s
    RETURNING word
    """
    cur.execute(cmd, (value, id))
    return cur.fetchall()

def deleteWord(cur, id):
    cmd = """
    DELETE FROM spellchecker
    WHERE word = %s"""
    cur.execute(cmd, (id,))

def parseResponse(response):
    resp_list = []
    for resp_tuple in response: 
        resp_list.append(resp_tuple[0])
    return resp_list

def handler(event, context):
    logger.info(event)
    if 'body' not in event:
        logger.error( 'Missing parameters')
        return {'result': False, 'msg': 'Missing parameters' }

    data = json.loads(event['body']) # use for postman tests
    # data = event['body'] # use for console tests
    logger.info(data)
    psql = postgresql.PostgreSQL()

    with psql.conn.cursor() as cur:
        try: 
            if data['operation'] == 'GET':
                response = psql.queryTable('spellchecker')
                resp_dict = {'result': True}
                logger.info(response)
                resp_list = parseResponse(response)
                resp_dict['data'] = resp_list
                return resp_dict

            elif data['operation'] == 'ADD':
                response = addWord(cur, data['values'])
                resp_list = parseResponse(response)
            elif data['operation'] == 'UPDATE': 
                updateWord(cur, data['id'], data['values'])
                resp_list = parseResponse(response)
            elif data['operation'] == 'DELETE':
                deleteWord(cur, data['id'])
            psql.commit() 
            if data['operation'] == 'ADD' or data['operation'] == 'UPDATE':
                return {'result': True, 'data': resp_list}
        except Exception as error:
            logger.error(error)
            logger.error("Exception Type: %s" % type(error))
            return {'result': False, 'msg': f'{error}'}

    return {'result': True}
    
