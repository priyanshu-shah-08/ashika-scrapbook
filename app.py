import json
import os
from flask import Flask, jsonify, render_template

app = Flask(__name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'chapters.json')


def load_chapters():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


@app.route('/')
def index():
    chapters = load_chapters()
    return render_template('index.html', total_chapters=len(chapters))


@app.route('/api/chapters')
def api_chapters():
    chapters = load_chapters()
    return jsonify(chapters)


if __name__ == '__main__':
    app.run(debug=True, port=5000)