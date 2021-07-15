import postgresql
import boto3
import logging
import json
import os
from datetime import date, datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def queryResults(cur, page):
    cmd = """
    SELECT req.id, state, error, request, age, height, weight, req.info, created_at, updated_at,
        ai_rule_candidates, ai_rule_id, ai_priority, ai_contrast, p5_flag, ai_tags,
        final_priority, final_contrast,
        labelled_rule_id, labelled_priority, labelled_contrast, labelled_notes
    FROM data_request as req
    ORDER BY req.updated_at DESC
    LIMIT 50 OFFSET %s
    """
    offset = (int(page) - 1) * 50
    cur.execute(cmd, (offset,))
    return cur.fetchall()


def queryPageCount(cur):
    cmd = """
    SELECT CEIL(CAST(COUNT(id) AS float)/50)
    FROM data_request
    """
    cur.execute(cmd)
    return cur.fetchall()[0][0]


def queryResultsID(cur, id):
    cmd = """
    SELECT req.id, state, error, request, age, height, weight, req.info, created_at, updated_at,
        ai_rule_candidates, ai_rule_id, ai_priority, ai_contrast, p5_flag, ai_tags,
        final_priority, final_contrast,
        labelled_rule_id, labelled_priority, labelled_contrast, labelled_notes
    FROM data_request as req
    WHERE req.id = %s
    ORDER BY req.updated_at DESC
    """
    cur.execute(cmd, [id])
    return cur.fetchall()


def updateFinalResults(cur, id, priority, contrast):
    cmd = """
    UPDATE data_request 
    SET final_priority = %s, final_contrast = %s
    WHERE id = %s
    RETURNING id, final_priority, final_contrast
    """
    cur.execute(cmd, (priority, contrast, id))
    return cur.fetchall()


def updateLabelledResults(cur, id, rule_id, priority, contrast, notes):
    cmd = """
    UPDATE data_request 
    SET labelled_rule_id = %s,  labelled_priority = %s, labelled_contrast = %s, labelled_notes = %s,
        state = 'labelled_priority'
    WHERE id = %s
    RETURNING id, labelled_rule_id, labelled_priority, labelled_contrast, labelled_notes
    """
    cur.execute(cmd, (rule_id, priority, contrast, notes, id))
    return cur.fetchall()


def getResultCount(cur, interval):
    if interval == 'DAILY':
        cmd = """
        SELECT COUNT(id)
        FROM data_request
        WHERE DATE(created_at) = current_date
        """
    elif interval == 'WEEKLY':
        cmd = """
        SELECT COUNT(id)
        FROM data_request
        WHERE EXTRACT(WEEK FROM created_at) = EXTRACT(WEEK FROM current_date)
        """
    elif interval == 'MONTHLY':
        cmd = """
        SELECT COUNT(id)
        FROM data_request
        WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM current_date)
        """
    cur.execute(cmd)
    return cur.fetchall()[0][0]


def queryRequestHistory(cur, id_data_request):
    cmd = """
    SELECT id_data_request, description, cognito_user_id, cognito_user_fullname, dob, height, weight,
        exam_requested, reason_for_exam, mod_info, created_at, history_type
    FROM request_history
    WHERE id_data_request = '%s'
    ORDER BY created_at DESC
    """
    # cur.execute(cmd, id_data_request)
    command = cmd % id_data_request
    logger.info(command)
    cur.execute(command)
    return cur.fetchall()


def queryRequestRule(cur, id_data_request):
    cmd = """
    SELECT rules.id, rules.body_part, rules.bp_tk, rules.info_weighted_tk, rules.priority,
    rules.contrast as rules_contrast, rules.info
    FROM mri_rules as rules
    WHERE rules.id = %s
    """
    # cur.execute(cmd, id_data_request)
    command = cmd % id_data_request
    logger.info(command)
    cur.execute(command)
    return cur.fetchall()


# insert_new_request_cmd = """
#     SELECT *
#     FROM request_history
#     WHERE id_data_request = '%s'
#     ORDER BY created_at DESC"""


insert_history_cmd = """
   INSERT INTO request_history(id_data_request, history_type, description, mod_info,
       cognito_user_id, cognito_user_fullname)
   VALUES (%s, 'modification', %s, %s, %s, %s)
   RETURNING history_type, description, mod_info, cognito_user_fullname, created_at
   """


def update_labelling(cur, data):
    cognito_user_id = ''
    if 'cognito_user_id' in data and data['cognito_user_id']:
        cognito_user_id = data["cognito_user_id"]
        logger.info(cognito_user_id)
    cognito_user_fullname = ''
    if 'cognito_user_fullname' in data and data['cognito_user_fullname']:
        cognito_user_fullname = data["cognito_user_fullname"]
        logger.info(cognito_user_fullname)

    # Save labelling fields
    id = data['id']
    response = updateLabelledResults(
        cur,
        id,
        data['labelled_rule_id'],
        data['labelled_priority'],
        data['labelled_contrast'],
        data['labelled_notes'])

    ret_update = {
        'id': response[0][0],
        'labelled_rule_id': response[0][1],
        'labelled_priority': response[0][2],
        'labelled_contrast': response[0][3],
        'labelled_notes': response[0][4]}
    logger.info('ret_update ret')
    logger.info(ret_update)

    # Save history event
    data = (id, 'Labelling Updated', json.dumps(ret_update), cognito_user_id, cognito_user_fullname)

    command = insert_history_cmd % data
    logger.info(command)

    cur.execute(insert_history_cmd, data)
    ret_insert = cur.fetchall()
    logger.info('ret_insert ret')
    logger.info(ret_insert)

    ret = [{
        **ret_update,
        'history_type': ret_insert[0][0],
        'description': ret_insert[0][1],
        'mod_info': ret_insert[0][2],
        'cognito_user_fullname': ret_insert[0][3],
        'date_created': datetime_to_json(ret_insert[0][4])}]
    logger.info('update_labelling ret')
    logger.info(ret)

    return ret


def datetime_to_json(obj):
    if isinstance(obj, (datetime, date)):
        return obj.strftime("%Y-%m-%d %H:%M:%S")
    else:
        return obj


def parseResponse(response):
    resp_list = []
    for resp_tuple in response:
        resp = {}

        # Rule - filled in queryAndParseResponseRuleCandidates
        # rule['rules_id'] = resp_tuple[2]
        # rule['info'] = resp_tuple[22]
        # rule['priority'] = resp_tuple[19]
        # rule['contrast'] = resp_tuple[20]
        # rule['body_part'] = resp_tuple[16]
        # rule['bp_tk'] = resp_tuple[17]
        # rule['info_weighted_tk'] = resp_tuple[18]

        resp['id'] = resp_tuple[0]
        resp['state'] = resp_tuple[1]
        resp['error'] = resp_tuple[2]
        resp['request_json'] = resp_tuple[3]  # Request
        resp['age'] = resp_tuple[4]
        resp['height'] = resp_tuple[5]
        resp['weight'] = resp_tuple[6]
        resp['info_json'] = resp_tuple[7]  # pre-process info
        resp['date_created'] = datetime_to_json(resp_tuple[8])
        resp['date_updated'] = datetime_to_json(resp_tuple[9])

        resp['rule_candidates_array'] = resp_tuple[10]  # array of rule id's
        resp['ai_rule_candidates'] = {}  # Filled later
        resp['ai_rule_id'] = resp_tuple[11]
        resp['ai_priority'] = resp_tuple[12]
        resp['ai_contrast'] = resp_tuple[13]
        resp['p5_flag'] = resp_tuple[14]
        resp['ai_tags'] = resp_tuple[15]

        resp['final_priority'] = resp_tuple[16]
        resp['final_contrast'] = resp_tuple[17]

        resp['labelled_rule_id'] = resp_tuple[18]
        resp['labelled_priority'] = resp_tuple[19]
        resp['labelled_contrast'] = resp_tuple[20]
        resp['labelled_notes'] = resp_tuple[21]

        resp['history'] = {}

        resp_list.append(resp)
    return resp_list


def parseResponseHistory(history):
    logger.info('history')
    logger.info(history)

    history_list = []
    for history_tuple in history:
        history_item = {}

        # history_item['id_data_request'] = history_tuple[0]
        history_item['history_type'] = history_tuple[11]
        history_item['description'] = history_tuple[1]
        history_item['cognito_user_id'] = history_tuple[2]
        history_item['cognito_user_fullname'] = history_tuple[3]
        history_item['dob'] = history_tuple[4]
        history_item['height'] = history_tuple[5]
        history_item['weight'] = history_tuple[6]
        history_item['exam_requested'] = history_tuple[7]
        history_item['reason_for_exam'] = history_tuple[8]
        history_item['mod_info'] = history_tuple[9]
        history_item['date_created'] = datetime_to_json(history_tuple[10])

        history_list.append(history_item)
    return history_list


def queryAndParseResponseRuleCandidates(cur, rule_candidates):
    logger.info('queryAndParseResponseRuleCandidates')
    logger.info(rule_candidates)

    rule_list = []
    if rule_candidates is None:
        return rule_list

    for rule_candidate in rule_candidates:
        ret_rules = queryRequestRule(cur, rule_candidate)
        if len(ret_rules) > 0:
            ret_rule = ret_rules[0]
            logger.info('ret_rule')
            logger.info(ret_rule)

            # Rule
            rule = {}
            rule['rules_id'] = ret_rule[0]
            rule['body_part'] = ret_rule[1]
            rule['bp_tk'] = ret_rule[2]
            rule['info_weighted_tk'] = ret_rule[3]
            rule['priority'] = ret_rule[4]
            rule['contrast'] = ret_rule[5]
            rule['info'] = ret_rule[6]

            rule_list.append(rule)

    return rule_list


def datetime_handler(x):
    if isinstance(x, datetime):
        return x.isoformat()
    raise TypeError("Unknown type")


def handler(event, context):
    logger.info(event)
    if 'body' not in event:
        logger.error('Missing parameters')
        return {"isBase64Encoded": False, "statusCode": 400, "body": "Missing Body Parameter loser",
                "headers": {"Content-Type": "application/json"}}

    data = json.loads(event['body'])  # use for postman tests
    # data = event['body'] # use for console tests
    logger.info(data)
    psql = postgresql.PostgreSQL()

    # CORS preflight for local debugging
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }

    with psql.conn.cursor() as cur:
        try:
            # command = insert_new_request_cmd % '10009'
            # cur.execute(command)
            # history2 = cur.fetchall()
            # # cur.execute(insert_new_request_cmd, '10009')
            # logger.info('history2')
            # logger.info(history2)

            resp_dict = {'result': True,
                         'headers': headers,
                         'data': []}
            if data['operation'] == 'GET':
                if 'id' in data.keys():
                    # TODO possible bug here as we should pass page here too - actually it only returns 1 max?
                    # Thus searching for 4: only returns exactly matching 4 and not '44', '445 for ex
                    response = parseResponse(queryResultsID(cur, data['id']))
                else:
                    response = parseResponse(queryResults(cur, data['page']))
                    # logger.info('parseResponse')
                    # logger.info(response)
                    resp_dict['total_pgs'] = queryPageCount(cur)

                for resp in response:
                    logger.info('resp')
                    logger.info(resp)
                    resp['history'] = parseResponseHistory(queryRequestHistory(cur, resp['id']))
                    logger.info(resp['history'])
                    # cio_id = resp['id']
                    # command = insert_new_request_cmd % cio_id
                    # logger.info(command)
                    # cur.execute(command)
                    #
                    # # cur.execute(insert_new_request_cmd, cio_id)
                    # history = cur.fetchall()
                    # logger.info('history')
                    # logger.info(history)
                    # # history = queryRequestHistory(cur, cio_id)
                    # resp['history'] = json.dumps(history, default=datetime_handler)
                    # logger.info('resp history')
                    # logger.info(resp['history'])
                    resp['ai_rule_candidates'] = queryAndParseResponseRuleCandidates(cur, resp['rule_candidates_array'])

            elif data['operation'] == 'UPDATE_FINAL':
                response = updateFinalResults(cur, data['id'], data['final_priority'], data['final_contrast'])
                response = [{'id': response[0][0], 'final_priority': response[0][1], 'final_contrast': response[0][2]}]

            elif data['operation'] == 'UPDATE_LABELLING':
                response = update_labelling(cur, data)

            elif data['operation'] == 'GET_DATA':
                daily = getResultCount(cur, 'DAILY')
                weekly = getResultCount(cur, 'WEEKLY')
                monthly = getResultCount(cur, 'MONTHLY')
                response = [{'daily': daily, 'weekly': weekly, 'monthly': monthly}]
            psql.commit()
            logger.info(response)
            resp_dict['data'] = response
            return resp_dict

        except Exception as error:
            logger.error(error)
            logger.error("Exception Type: %s" % type(error))
            return {"isBase64Encoded": False, "statusCode": 400, "body": f'{type(error)}',
                    "headers": {"Content-Type": "application/json"}}

    return {'result': True, 'headers': headers}
