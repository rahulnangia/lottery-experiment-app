from flask import Flask, render_template, request, jsonify
import requests,json
import pymysql.cursors

app = Flask(__name__)

connection = pymysql.connect(host='',
                             user='',
                             password='',
                             db='lottery',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)

@app.route("/health")
def health():
    return "Working!"


# @app.route("/hello/<string:name>")
# def hello(name):
#     return render_template('index.html', greeting='Hello', name=name)

@app.route("/", methods=["GET","POST"])
def index():
    return render_template('index.html')

@app.route("/insert", methods=["POST"])
def search():
    # import ipdb;ipdb.set_trace()
    data = request.form
    uid = data['uid']
    age = int(data['age'])
    gender = data['gender']
    balance = float(data['balance'])
    bet = float(data['bet'])
    win = 1 if data['win'].lower() == 'true' else 0
    treatment = 1 if data['treatment'].lower() == 'true' else 0
    plays = int(data['plays'])
    wticket = data['wticket']
    uticket = data['uticket']
    rows = 0
    try:
        with connection.cursor() as cursor:
            # Create a new record
            sql = "INSERT INTO data (uid, age, gender,balance,bet,win,treatment,plays, wticket, uticket) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            rows = cursor.execute(sql, (uid, age, gender, balance, bet, win, treatment, plays, wticket, uticket))

        # connection is not autocommit by default. So you must commit to save
        # your changes.
        connection.commit()
    except:
        return jsonify('Failed'), 500
    return jsonify(rows), 200


@app.route("/test", methods=["GET"])
def test():
    rows = 0
    try:
        with connection.cursor() as cursor:
            # Create a new record
            sql = "INSERT INTO data (uid, age, gender,balance,bet,win,treatment,plays, wticket, uticket) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            rows = cursor.execute(sql, ("test", 2, 'MALE', 4.0, 1.0, 1, 0, 1, '123456', '123456'))

        # connection is not autocommit by default. So you must commit to save
        # your changes.
        connection.commit()
    except:
        return 'Failed', 500
    return  rows, 200

if __name__ == '__main__':
    app.run(debug=True)
    # app.run(host='0.0.0.0', debug=False)
