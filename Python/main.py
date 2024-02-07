from flask import Flask, jsonify, request
from flask_cors import CORS
from DataAccess.wikiquery import WikiQuery
from DataAccess.disambiguation import Disambiguation
from waitress import serve


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/', methods=["GET"])
def Hello():
    return "This is the Flying Digital Editions API"

@app.route('/getEntities', methods=['GET', 'OPTIONS','POST'])
def getEntities():
    if request.method == 'OPTIONS':
        response = jsonify(success=True)
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    if request.method == 'POST':
        try:
            data = request.get_json()
            text = data['text']
            findEntity = Disambiguation()
            results = findEntity.convertText(text)
            return jsonify(results)
        except Exception as e:
            return jsonify(success=False, message="Error processing request")

    return jsonify(success=False, message="Invalid request method")

@app.route('/<string:type>/<string:id>', methods=['GET', 'OPTIONS'])
def getEntityInfo(type, id):
    if request.method == 'OPTIONS':
        response = jsonify(success=True)
        response.headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    if request.method == 'GET':
        info = WikiQuery()
        result = info.findEntityInfo(type, id)
        return jsonify(result)
    
    return jsonify(success=False, message="Invalid request method")


if __name__ == '__main__':
    serve(app, port=8888, host="localhost")
