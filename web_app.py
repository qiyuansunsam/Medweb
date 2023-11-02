from flask import Flask, request, jsonify, render_template, redirect, url_for
from waitress import serve
import openai
import os

openai.api_key = "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"
app = Flask(__name__)
app.secret_key = os.urandom(24)
defualt_message = {"role": "user", "content": "you are a questionnaire bot, now you need to gather info about only \
                   gender, other symptons, how long have the patient got the conditions, and age, based on my following response\
                    ask me question's if one is not answered yet, when they all answered, reply the with the string containing ********"}
channels = {}
summeries = {}
book = []
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    if username != "GP":
        if username not in channels:
            channels[username] = [defualt_message]
            summeries[username] = ""
        return jsonify({"status": "success", "redirect_url": url_for('messaging', username=username)})
    else:
        return jsonify({"status": "success", "redirect_url": url_for('dashboard')})

@app.route('/logout', methods=['POST'])
def logout():
    return redirect(url_for('index'))

@app.route('/messaging/<username>')
def messaging(username):
    return render_template('messaging.html', username=username)

@app.route('/booking', methods=['GET'])
def booking():
    return render_template('booking.html')

@app.route('/booking', methods=['POST'])
def booked():
    val = request.get_json().get('val')
    user = request.get_json().get('user')
    print(user)
    book.append(f'Time:{val}\nBooker:{user}\ndetials:\n{summeries[user]}\nmedical histories:...'.split('\n'))
    print(book)
    return render_template('vid.html')

@app.route('/sup', methods=['GET'])
def sup():
    return render_template('sup.html')



@app.route('/vid', methods=['GET'])
def vid2():
    return render_template('vid.html')

@app.route('/vid2', methods=['GET'])
def vid():
    return render_template('vid2.html')

@app.route('/dashboard')
def dashboard():
    print(book)
    return render_template('dashboard.html', users=book)

@app.route('/send-message', methods=['POST'])
def send_message():
    user = request.json.get('username')  # get current username
    if user not in channels:
        channels[user] = [defualt_message]
    message = request.json.get('message')
    if "prompt" in message:
        return jsonify({"message": "Thank you for you information</br>If you want pharmacist to assist the call:</br><a href='/sup'>supervised booking</a></br>or simiply find your favourite GP:</br><a href='/booking'>direct booking</a>"})
    if sum(len(value["content"]) for value in channels[user]) + len(message) > 4000:
        channels[user] = [defualt_message]  # reset the user's messages if they're too long
    
    channels[user].append({"role": "user", "content": message})
    try:
        summerized = openai.ChatCompletion.create(
            model="gpt-3.5-turbo", messages=channels[user]+[{"role":'user', "content":"summerize in bullet points of the above context without any *"}]
        )
    except Exception as e:
        return jsonify({"message": str(e)})
    summeries[user] = summerized.choices[0].message.content if summerized else ""
    print(summeries[user])
    try:
        chat_completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo", messages=channels[user]
        )
    except Exception as e:
        return jsonify({"message": str(e)})

    reply = chat_completion.choices[0].message.content if chat_completion else ""
    print(reply)
    if "********" in reply:
        return jsonify({"message": "Thank you for you information</br>If you want pharmacist to assist the call:</br><a href='/sup'>supervised booking</a></br>or simiply find your favourite GP:</br><a href='/booking'>direct booking</a>"})
    channels[user].append({"role": "system", "content": reply})
    return jsonify({"message": reply + "\n"})

if __name__ == "__main__":
    #app.run(debug=True)
    serve(app, host="0.0.0.0", port=8090)
