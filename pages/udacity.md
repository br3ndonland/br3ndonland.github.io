---
permalink: /udacity
---

# Udacity training

<img src="../img/udacity-long.svg" alt="Udacity logo SVG" id="udacity-logo" class="svg" width="75%"><img src="../img/udacity-long-white.svg" alt="Udacity logo SVG" id="udacity-logo-light" class="svg d-none" width="75%">

- [Full Stack Web Developer](#full-stack-web-developer)
  - [Lessons](#lessons)
  - [Projects](#projects)
  - [Nanodegree completion](#nanodegree-completion)
- [Grow with Google](#grow-with-google)
  - [Description](#description)
  - [Meetups](#meetups)
  - [MBTAccess](#mbtaccess)
- [Mobile Web Specialist](#mobile-web-specialist)
  - [Restaurant reviews](#restaurant-reviews)

---

## Full Stack Web Developer

This was the first training program I did. Here are some highlights from my work in the program:

### Lessons

Udacity introduces key information and skills in lessons prior to each project.

#### Break timer

<a href="https://github.com/br3ndonland/udacity-fsnd/blob/master/1-foundations/python/fsnd01_05_functions.ipynb" target="_blank">Code on GitHub</a>

**This was my first milestone as a computer programmer.**

When I began learning Python syntax in the Full Stack Web Developer Nanodegree program, progress was slow, and it was difficult to express myself. It felt very much like the mental exhaustion of practicing a spoken language. The Udacity introductory materials actually recommended that I start with a beginner Nanodegree program first, but I knew that with my motivation and education, I could fill in the gaps in my knowledge and competency. I kept at it and didn't let myself get discouraged.

I got to an exercise in which I had to create a break timer. The timer opens a YouTube video every two hours, to encourage people to take a break while working on the computer. I wrote the code independently, then checked the instructor's solution.

When adding a loop to the break counter, **I came up with a more efficient way to write the program** by using a `for` loop instead of a `while` loop, reducing the required amount of code from eight lines to five. **My code demonstrated that I had learned to think independently and write code in the most efficient and <a href="https://www.python.org/dev/peps/pep-0020/" target="_blank">Pythonic</a> way.**

My Python code:

```python
# My break timer
import time
import webbrowser

for i in range(4):
    time.sleep(2 * 60 * 60)
    webbrowser.open_new_tab("https://www.youtube.com/watch?v=IuGO6WHcruU")

```

Instructor's Python code:

```python
# Instructor's break timer
import time
import webbrowser

total_breaks = 4
break_count = 0

while break_count < total_breaks:
    time.sleep(2 * 60 * 60)
    webbrowser.open_new_tab("https://www.youtube.com/watch?v=IuGO6WHcruU")
    break_count = break_count + 1

```

**I realized the significance of this exercise because I had learned about computing history.** I thought about how Bill Gates and Paul Allen's major accomplishment while at Harvard was writing a BASIC interpreter for the Altair in 3.2 kilobytes of text, leaving memory free to write other programs and launching the personal computing software industry. Walter Isaacson's article on this topic, "<a href="https://news.harvard.edu/gazette/story/2013/09/dawn-of-a-revolution/" target="_blank">Dawn of a revolution</a>," (_Harvard Gazette_ 201309), and the corresponding book, <a href="https://en.wikipedia.org/wiki/The_Innovators_(book)" target="_blank">The innovators</a>, were key parts of my computing curriculum.

Computer memory is less limiting today, but we still have to write code efficiently, especially when it is accessed over the web through Content Distribution Networks (CDNs). This is why we use code minification for web distribution.

#### Turtle graphics

<a href="https://github.com/br3ndonland/udacity-fsnd/blob/master/1-foundations/python/fsnd01_06_classes_turtles.ipynb" target="_blank">Code on GitHub</a>

Instead of just drawing a shape, I imported a gif for the background, and looped through a colorspace to create a psychedelic effect.

Python code:

```python
# Turtle graphics
import turtle
import colorsys


def spiral_into_the_grid():
    """Use turtle graphics to create a colorful spiral."""
    turtle.setup(width=1600, height=900)
    turtle.speed(0)
    turtle.hideturtle()
    window = turtle.Screen()
    window.bgpic("img/TRON.gif")

    for i in range(1250):
        colors = colorsys.hsv_to_rgb(i / 1250, 1.0, 1.0)
        turtle.color(colors)
        turtle.forward(i)
        turtle.left(115)

    turtle.done()


spiral_into_the_grid()

```

Output:

<img src="../img/turtles-final-small.png" alt="Turtle graphics mini-project final image" class="img-fluid">

#### Profanity checker

<a href="https://github.com/br3ndonland/udacity-fsnd/blob/master/1-foundations/python/fsnd01_08_classes_checker.ipynb" target="_blank">Code on GitHub</a>

I wrote a program that analyzes text files, and shows an alert when profanity is detected. I adapted the code for Python 3 and made it as concise as possible. When I realized there was a more effective way to write the program with the `Requests` module, I learned about it and rewrote my code.

Input from _movie_quotes.txt_:

```text
-- Houston, we have a problem. (Apollo 13)

-- Mama always said, life is like a box of chocolates. You never know what you are going to get. (Forrest Gump)

-- You cant handle the truth. (A Few Good Men)

-- I believe everything and I believe nothing. (A Shit in the Dark)
```

Python code:

```python
# Profanity checker

import requests


def read_text():
    """Read the contents of a text file."""
    quotes = open("movie_quotes.txt")
    contents_of_file = quotes.read()
    print(contents_of_file)
    quotes.close()
    check_profanity(contents_of_file)


def check_profanity(text_to_check):
    """Check the text file for profanity."""
    # Web query
    r = requests.get("http://www.wdylike.appspot.com/?q=" + text_to_check)
    # Output
    if "true" in r.text:
        print("Profanity Alert!")
    elif "false" in r.text:
        print("This document has no curse words!")
    else:
        print("Could not scan the document properly.")


read_text()

```

Output:

```text
-- Houston, we have a problem. (Apollo 13)

-- Mama always said, life is like a box of chocolates. You never know what you are going to get. (Forrest Gump)

-- You cant handle the truth. (A Few Good Men)

-- I believe everything and I believe nothing. (A Shit in the Dark)
Profanity Alert!
```

### Projects

The Full Stack Web Developer Nanodegree program is focused on projects, in which students can independently implement what they have learned in the lessons.

When coding projects, I keep **computational narratives** describing what I do at each step, like journals or lab notebooks. I learned how to keep computational narratives from scientific computing in Jupyter Notebook/JupyterLab and RMarkdown. Computational narratives capture my train of thought, so I can retrace my steps, retain what I have learned, and teach others. Computational narratives for these projects are available in their GitHub repositories.

#### Project 1. Python web server

<a href="https://github.com/br3ndonland/udacity-fsnd-p1-python-movie-site" target="_blank">Code on GitHub</a>

<img src="../img/python-web-server-page.png" alt="Python web server screenshot" class="img-thumbnail">

For my first project, I created a Python web server that serves a movie trailer website. The Python code stores a list of movies, including artwork and trailers, and serves the data to a local webpage with HTML and CSS. I personalized it with a film noir theme, and wrote a mini-review for each movie. I passed code review with only minor corrections.

#### Project 2. Designer mockup

<a href="https://github.com/br3ndonland/udacity-portfolio" target="_blank">Code on GitHub</a>

<a href="https://br3ndonland.github.io/udacity-portfolio/" target="_blank">Website</a>

<img src="../img/portfolio-pagespeed-insights.png" alt="Portfolio website screenshot" class="img-thumbnail">

The website you're at now began as my second project for the Udacity Full Stack Web Developer nanodegree program. We were provided with a design mockup (screenshot) of a developer portfolio webpage, and had to replicate the design with HTML and CSS. I based the webpage styling on Bootstrap 4. After replicating the design, I was able to add extensive customization, including a toggle button that uses jQuery JavaScript to change the page color scheme. I then built the single webpage into a full website with Jekyll, and hosted it on GitHub Pages. I extended the Udacity website to create this website.

#### Project 3. Database analysis

<a href="https://github.com/br3ndonland/udacity-fsnd-sql-logs" target="_blank">Code on GitHub</a>

<img src="../img/database-analysis.png" alt="Database analysis thumbnail" class="img-thumbnail">

For this project, I wrote a Python program, containing SQL queries, to extract information from a database of news articles with over a million rows. The SQL queries contain advanced joins, selection, and calculation features. The results of the three queries are returned in plain text with Pythonic formatting.

I passed initial code review with no required corrections. The reviewer made some helpful suggestions, and I incorporated them into my code.

#### Project 4. Brendon's bodybuilding bazaar

<a href="https://github.com/br3ndonland/udacity-fsnd-flask-catalog" target="_blank">Code on GitHub</a>

<img src="../img/flask-app.png" alt="Flask app screenshot simulating iPhone 6S with Firefox Developer Tools" class="img-thumbnail">

I was able to bring together my work on Python, databases, and websites to create a full web application. The app is called "Brendon's Bodybuilding Bazaar" and features a catalog of items useful for bodybuilding, along with an awesome classic picture of Arnold Schwarzenegger and Franco Columbu. I used the Python micro-framework Flask to control the app, and a SQLite database to hold information for the catalog. Users can sign in with Google. After signing in, users can add items and categories to the catalog. The creator of each item or category can also edit or delete it. The app's API (Application Programming Interface) provides catalog data in JSON format. I passed Udacity code review with no required corrections, and the reviewer commended me for my work on the project.

#### Project 5. Boston's best beans

<a href="https://github.com/br3ndonland/udacity-fsnd-p5-map" target="_blank">Code on GitHub</a>

<img src="../img/map-app.png" alt="JavaScript map screenshot" class="img-thumbnail">

This project required me to create a navigation web app that combines data from multiple APIs. I decided to theme the app after another one of my favorite things, specialty coffee. I started by using the Google Maps Platform to generate a map. Google Maps lacks an API for place lists, so I used the Foursquare API to retrieve places and their data. I used the Knockout framework to bind the JavaScript code with the webpage, so click events can trigger changes on the map. Functions run in response to click events, and the location list can be filtered by city. I went beyond the project's requirements to implement ES6+ JavaScript features, like Fetch, Async/Await, and array methods. Again, I passed Udacity code review with complements from the reviewer and no required corrections.

The Boston's best beans list is also available on <a href="https://foursquare.com/user/480979057/list/bostons-best-beans" target="_blank">Foursquare</a>.

#### Project 6. Linux server configuration and app deployment

<a href="https://github.com/br3ndonland/udacity-fsnd-flask-catalog-server" target="_blank">Code on GitHub</a>

App was deployed to Linux Apache server at catalog.br3ndonland.com.

<img src="../img/server.png" alt="Server project logos: Flask, Ubuntu, Apache" class="img-thumbnail">

For my final project, I configured an Ubuntu Linux server instance on DigitalOcean and deployed the Flask app from project 4 onto the server.

### Nanodegree completion

<img src="../img/udacity-fsnd-certificate-crop.png" alt="Nanodegree certificate screenshot" class="img-thumbnail">

I'm a full stack web developer! I completed the Nanodegree program in June 2018. I put about ten months of work into this program, and came out with a solid set of skills. Full stack web developers work on all aspects of websites and apps, from front end (features that users see) to back end (servers and databases). In this program, I built skills including:

- Developing webpages based on mockup images from designers
- Querying and manipulating large databases with SQL
- Creating functional multi-page web apps with databases and sign-ins
- Fetching data from Application Programming Interfaces (APIs)
- Deploying apps to Linux servers

[(Back to top)](#top)

---

## Grow with Google

<img src="../img/udacity-google-scholarship.png" alt="Udacity Grow with Google scholarship award">

### Description

**I won a <a href="https://www.udacity.com/grow-with-google" target="_blank">scholarship</a> from Udacity and Google.** <a href="https://grow.google/" target="_blank">Grow with Google</a> is an initiative to help people make career changes into coding. I was accepted to the intermediate web developer track to learn techniques for building progressive web apps. There was a three month challenge round, after which the top participants move on to a more advanced Mobile Web Specialist program.

Here's how it went down:

- Found out about the Grow with Google scholarship via Udacity's <a href="https://www.facebook.com/Udacity/posts/1250067568431912" target="_blank">Facebook</a> and <a href="https://medium.com/udacity/grow-with-google-50-000-new-scholarships-available-now-1aa0513430b6" target="_blank">Medium</a> posts, while on a bus to NYC for the New York Coffee Festival on October 14, 2017.
- <a href="https://github.com/br3ndonland/udacity-google/blob/master/udacity-google-00-apply.md" target="_blank">Applied</a> in December 2017.
- Won the scholarship in January 2018.
- Started the challenge course materials on February 21, 2018.
- Completed the challenge course materials on March 7, 2018. The course taught us how to build progressive web apps and use the new features in JavaScript ES6. I tracked my work and made it available on <a href="https://github.com/br3ndonland/udacity-google" target="_blank">GitHub</a>.
- Attended five local meetups.
- Started building a collaborative open-source transportation app, <a href="https://github.com/growwithgooglema/mbtaccess" target="_blank">MBTAccess</a>, in April 2018.
- **Ranked in the top 10% of 10,000 students in the intermediate web developer track.** Ranking was based on completing all course materials, as well as participation in the Slack workspace, discussion forum, and meetups.
- **Won a full scholarship to the [Udacity Mobile Web Specialist Nanodegree program](#mobile-web-specialist)** on April 17, 2018.

### Meetups

#### Grow with Google meetup at Boston Public Library, February 24, 2018

<img src="../img/gwg-meetup-20180224-bpl.jpg" alt="Grow with Google meetup at Boston Public Library, February 24, 2018" class="img-fluid">

#### Grow with Google meetup in Watertown, March 24, 2018

<img src="../img/gwg-meetup-20180324-watertown.jpg" alt="Grow with Google meetup in Watertown, March 24, 2018" class="img-fluid">

#### Grow with Google meetup at MIT, March 24, 2018

<img src="../img/gwg-meetup-20180324-mit.jpg" alt="Grow with Google meetup at MIT, March 24, 2018" class="img-fluid">

#### Grow with Google meetup at MIT, March 29, 2018

<img src="../img/gwg-meetup-20180329-mit.jpg" alt="Grow with Google meetup at MIT March 29, 2018" class="img-fluid">

#### Grow with Google meetup at MIT, April 7, 2018

<img src="../img/gwg-meetup-20180407-mit.jpg" alt="Grow with Google meetup at MIT April 7, 2018" class="img-fluid">

### MBTAccess

<img src="../img/mbtaccess-20190902-iPhone-X.png" alt="MBTAccess app screenshot simulating iPhone X" class="img-thumbnail">

<a href="https://github.com/growwithgooglema/mbtaccess" target="_blank">Source code on GitHub</a>

**The [Grow with Google meetups](#meetups) led us to develop an app together.**

We found some common interest in transportation apps. MBTA recently released their <a href="https://api-v3.mbta.com/" target="_blank">MBTA V3 API</a> that provides public transportation data in JSON API format. One of the under-utilized datasets in their API is the wheelchair accessibility of the stops. Google Maps had <a href="https://fortune.com/2018/03/15/google-maps-wheelchair-accessible-routes/" target="_blank">recently started</a> providing wheelchair accessibility info, but their implementation is not particularly extensive.

**We aim to create a web app that quickly and conveniently identifies wheelchair accessible stops near the user.** The project has been productive, and has given us great experience managing a team through GitHub.

[(Back to top)](#top)

---

## Mobile Web Specialist

**I won a full scholarship to the Udacity Mobile Web Specialist Nanodegree program** after completing the Grow with Google challenge course and ranking in the top 10% of 10,000 students. They announced scholarship winners on April 17, 2018.

<img src="../img/udacity-google-mws-award.png" alt="Udacity Google Mobile Web Specialist scholarship email" class="img-fluid">

### Restaurant reviews

<a href="https://github.com/br3ndonland/udacity-google-mws" target="_blank">Code on GitHub</a>

<img src="../img/udacity-google-mws-iPhone.png" alt="Udacity Google Mobile Web Specialist screenshot" class="img-thumbnail">

Mobile Web Specialists are trained in building **Progressive Web Apps** (PWAs, see <a href="https://developers.google.com/web/progressive-web-apps/" target="_blank">Google</a>, <a href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps" target="_blank">Mozilla</a>, and <a href="https://medium.com/javascript-scene/native-apps-are-doomed-ac397148a2c0" target="_blank">Medium</a>). PWAs are like a combination of web apps and native apps, improving on the best features of each.

In the <a href="https://www.udacity.com/course/mobile-web-specialist-nanodegree--nd024" target="_blank">Udacity Mobile Web Specialist Nanodegree program</a>, I built a restaurant reviews PWA that displays restaurant locations and info. The app provides offline access through the Service Worker, IndexedDB, and web manifest files. Users can add favorites and reviews for restaurants. If changes are made offline, they sync to the web server when network access is restored.

[(Back to top)](#top)
