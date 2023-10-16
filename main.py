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


'''I am Galileo Galilei. I chanced to be several years since, at several times, in the Stupendious Citty of Venice, where I
    conversed with Signore Giovan Francesco Sagredo of a Noble Extraction, and piercing wit. There
    came thither from Florence at the same time Signore Filippo Salviati, whose least glory was the
    nence of his Blood, and Magnificence of his Estate: a sublime Wit that fed not more hungerly upon
    any pleasure than on elevated Speculations. In the company of these two I often discoursed of these
    matters before a certain Peripatetick Philosopher who seemed to have no geater obstacle in
    ing of the Truth, than the Fame he had acquired by Aristotelical Interpretations.
    Now, seeing that inexorable Death hath deprived Venice and Florence of those two great Lights in
    the very Meridian of their years, I did resolve, as far as my poor ability would permit, to perpetuate
    their lives to their honour in these leaves, bringing them in as Interlocutors in the present Controversy.
    Nor shall the Honest Peripatetick want his place, to whom for his excessive affection to wards the
    mentaries of Simplicius, I thought fit, without mentioning his own Name, to leave that of the Author
    he so much respected. Let those two great Souls, ever venerable to my heart, please to accept this
    blick Monument of my never dying Love; and let the remembr ance of their Eloquence assist me in
    delivering to Posterity the Consider ations that I have promised.'''