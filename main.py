from flask import Flask, jsonify, request
from flask_cors import CORS
from DataAccess.wikiquery import WikiQuery
from DataAccess.disambiguation import Disambiguation

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def getEntities():
    data = request.get_json()
    text = data['text']
    findEntity = Disambiguation()
    
    results = findEntity.convertText(text)
    return results

@app.route('/<string:type>/<string:id>', methods=['GET'])
def getEntityInfo(type, id):
    info = WikiQuery()

    result = info.findEntityInfo(type, id)
    return jsonify(result)


if __name__ == '__main__':
    app.run(port=8888)
