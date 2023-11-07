import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from DataAccess.wikiquery import Result
from DataAccess.disambiguation import Disambiguation

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET', 'POST'])
def returnInfo():
    data = request.get_json()
    text = data['text']
    findEntity = Disambiguation()
    
    results = findEntity.convertText(text)
    return results

if __name__ == '__main__':
    app.run(port=8888)
