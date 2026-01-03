import os
import requests
from flask import Flask, request, Response, jsonify, send_file, send_from_directory

app = Flask(__name__)
SAVE_DIR = 'screen_recordings'
os.makedirs(SAVE_DIR, exist_ok=True)

@app.route('/')
def login():
    return send_file('templates/login/login.html')

@app.route('/home')
def home():
    return send_file('templates/index.html')

@app.route('/delete-videos')
def delete_videos():
    path = os.path.join(os.getcwd(), 'screen_recordings')
    files = os.listdir(path)
    print(files != [])
    if files != []:
        for filename in files:
            file_path = os.path.join(path, filename)
            os.remove(file_path)
    requests.post('https://cslckrwbcl.lrdevstudio.com/messages', json={'action': 'delete-videos'})
    return {'status': 'no-files-found'}

@app.route('/fetch_recording/<computer>/<timestamp>')
def fetch_recording(computer, timestamp):
    filename = f"screen-recording-{computer}-{timestamp}.mp4"
    filepath = os.path.join(SAVE_DIR, filename)

    resp = requests.post(
        'https://cslckrwbcl.lrdevstudio.com/messages',
        json={'action': f'collect-recorded-{computer}', 'time': timestamp},
    )
    
    if resp.status_code != 200:
        return jsonify({'error': 'Failed to fetch video', 'status': resp.status_code}), 400

    with open(filepath, 'wb') as f:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)

    return send_file(
        filepath,
        mimetype='video/mp4',
        as_attachment=False,
        conditional=True
    )

@app.route('/resources/<path:filename>')
def serve_resource(filename):
    return send_file(f'templates/{filename}')

@app.route('/screen_recordings/<path:filename>')
def serve_recording(filename):
    return send_file(f'{SAVE_DIR}/{filename}')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8004, debug=True)