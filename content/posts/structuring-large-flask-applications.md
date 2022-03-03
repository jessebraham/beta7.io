+++
title       = "Structuring Large Flask Applications"
date        = "2018-05-31"
description = "An example of how to structure a medium to large sized Flask application, with boilerplate for common setup and configuration."
+++


[Flask](http://flask.pocoo.org/) is a lightweight web framework for [Python](https://www.python.org/). It allows for rapid application development, and includes a number of incredibly useful helpers and extensions which make the development process a breeze. One thing that can be problematic as projects grow larger, however, is properly structuring our application's various modules to work together seamlessly.

In this post, we will go over an incredibly basic Flask application to demonstrate the layout I have come to use over the years. While it's not perfect, I have found it to be a great starting point from which to build from.

If you're not looking for an in-depth explanation, the full source code can be found in the [jessebraham/flask_structure_example](https://github.com/jessebraham/flask_structure_example) repository on [Github](https://github.com/). All files are heavily commented to make things as clear as possible.


# Table of Contents

- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Creating the Application](#creating-the-application)
- [Extending the Application](#extending-the-application)
- [Blueprints](#blueprints)
- [Wrapping Up](#wrapping-up)


# Getting Started

Before we get started, let's take a glance what our final directory and file structure will look like at the end of this guide. Note that `__init__.py` files are not included in the file tree for the sake of clarity, but that one does exist in the root of each module (which they must, by definition).

```bash
flask_structure_example
  app/
    blueprints/
       home/
        views.py
    models/
    static/
    templates/
    errors.py
    extensions.py
    factory.py
  config/
    settings.py
  instance/
    settings.py
  .env
  Pipfile
  Pipfile.lock
```

The `app` module holds the bulk of our Flask application. The `blueprints` module within `app/` is for, as you may have guessed, all logic related to any [blueprints](http://flask.pocoo.org/docs/1.0/blueprints/) we define within our application. The `models` module will house any [SQLAlchemy models](http://flask-sqlalchemy.pocoo.org/2.3/models/) that we may declare down the road, which provide mappings from database records to objects. The `static/` and `templates/` directories hold assets and templates global to the application. You would store things such as CSS, JavaScript and images in the `static/` directory, and [Jinja2](http://jinja.pocoo.org/) templates and macros in the `templates/` directory.

The `config/` and `instance/` directories are intended for holding configuration files. The base configuration for the application is set in `config/settings.py`, and optionally from within `instance/settings.py` to override the default settings. The `instance/` directory is also used for holding the log and database files for the purpose of this example.

Having walked through the structure of our application, we'll begin by creating the project directory, before changing into it and creating our virtual environment using [Pipenv](https://docs.pipenv.org/). If you do not have pipenv installed on your system, please refer to the aforementioned documentation on installation. This example was developed using **Python 3.6.5**, but should work with most versions of **Python 3.X** to my knowledge. If you encounter an issue with a different version of Python, please consider submitting an issue to the [Github repository](https://github.com/jessebraham/flask_structure_example). Once our virtual environment has been created, we'll activate it.

```bash
$ mkdir flask_structure_example && cd $_
$ pipenv --three --python 3.6.5 # or whichever version you'd prefer
$ pipenv shell
```

With our virtual environment created an activated, we can now install our dependencies. For this example, we only require the [Flask](http://flask.pocoo.org/) and [Flask SQLAlchemy](http://flask-sqlalchemy.pocoo.org/) packages. We'll install these using pipenv:

```bash
$ pipenv install flask flask-sqlalchemy
```


# Configuration

First we are going to define the default configuration for our application. Configuration will be performed primarily in `config/settings.py`. If you have any values that should not be published in a public repository, or differ between development and production environments, all configuration values can be overridden using `instance/settings.py`. This can be taken a step further, and specific development and production configuration files can be created and loaded, but this is beyond the scope of what I feel is necessary for this project.

```bash
$ mkdir config && touch config/{__init__,settings}.py
$ # And optionally...
$ mkdir instance && touch instance/{__init__,settings}.py
```

While you don't necessarily *need* to provide any configuration to your Flask application, there are a handful of items that I have found useful and common enough that I provide them by default. Down the line these items can always be removed or modified if they are no longer applicable.

Go ahead and open up `config/settings.py` in your favorite text editor. We will require two modules to be imported in our configuration file, `logging` and `os`.

```python
import logging
import os
```

With these modules imported, we can start defining configuration values:

```python
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), os.pardir))
```

This first value is not a part of Flask's configuration, but is merely a helper for later on in the configuration. Here we are storing the absolute path to the root of the project directory in a variable.

```python
DEBUG = True
TESTING = False
```

When we're in development, we will always enable `DEBUG`. This is a great example of a configuration item that should be overridden in `instance/settings.py` in production. `TESTING` is disabled by default, but will be enabled when running unit tests.

```python
SECRET_KEY = 'a-not-so-secret-key-000-!!!'
```

`SECRET_KEY` is used for cryptographically signing cookies, which in turn are used for sessions. This means that cookies cannot be modified by anybody who does not possess the secret key. This value should definitely be stored in `instance/settings.py` in production, but for the sake of this example we've included a simple placeholder value which will be more than adequate.

In production, `SECRET_KEY` should be set to a securely randomized string. You can easily generate one using Python by opening a REPL (running `python` in your terminal) and entering:

```python
import binascii
import os
binascii.hexlify(os.urandom(24))
```

Last, let's get logging configured for our application. This is rather simple, due to the fact that Flask integrates Python's built-in logger. Because of this, configuration is the exact same as it would normally be in any other Python project. Pretty neat.

```python
LOGGING_FORMAT = '%(asctime)s %(levelname)s: %(message)s ' \
                 '[in %(pathname)s:%(lineno)d]'
LOGGING_LOCATION = os.path.join(PROJECT_ROOT, 'instance', 'app.log')
LOGGING_LEVEL = logging.DEBUG
```

Here we are setting `LOGGING_FORMAT` to a fairly standard format, specifying the location to write the log file to with `LOGGING_LOCATION`, and setting `LOGGING_LEVEL` to Debug by default. In production you'd likely change this to a higher level. For more information on logging refer to the [logging module documentation](https://docs.python.org/3.6/library/logging.html).


# Creating the Application

With initial configuration out of the way, it's time to start building out our application. We will be using the [factory method pattern](https://en.wikipedia.org/wiki/Factory_method_pattern) to instantiate and configure our Flask application. This allows us to run any number of instances of our application, makes it easier to write well structured and flexible code, and drastically simplifies unit testing. Additional information on this pattern, specifically pertaining to Flask, can be found in the Flask documentation on [Application Factories](http://flask.pocoo.org/docs/0.12/patterns/appfactories/). Let's begin by creating the necessary files:

```bash
$ touch app/{__init__,factory}.py
```

With that, open up `factory.py` and implement the following function:

```python
from flask import Flask

def create_app(settings_override=None):
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_object('config.settings')
    app.config.from_pyfile('settings.py', silent=True)

    if settings_override:
        app.config.update(settings_override)

    return app
```

This is fairly straight-forward, but let's take a closer look at it.

We start by instantiating the Flask application object. We set the `instance_relative_config` parameter to `True`, which allows us to load files relative to the instance folder, rather than relative to the project's root directory.

Next, we apply our default configuration from `config/settings.py`, as well any overridden configuration values found in `instance/settings.py`. Setting the `silent` parameter to `True` will suppress errors if the file is missing or otherwise cannot be read.

The `settings_override` parameter, if provided, will be a `dict`. If this parameter was provided, we will now update our application's configuration to reflect the values provided.

Lastly, we return our Flask application instance.

In order to run our application, we will use Flask's built-in [command line utility](http://flask.pocoo.org/docs/0.12/cli/).

```bash
$ export FLASK_APP=app.factory
$ flask run
Serving HTTP on 0.0.0.0 port 8000 ...
```

We declare an environment variable for the Flask CLI, `FLASK_APP`, which sets the application path for the Flask CLI; in our case it is our factory module within `app`. We then run our application using the Flask CLI. If all goes well, you should now have a running Flask application!

In order to avoid having to export the required environment variables each time you work on the project, it's a good idea to create an `.env` file in the root of your project and store the values there; you can then source the file instead:

```bash
$ echo 'export FLASK_ENV=development' > .env
$ echo 'export FLASK_APP=app.factory' >> .env
$ # Source the .env file to export the environment variables
$ source .env
$ flask run
Serving HTTP on 0.0.0.0 port 8000 ...
```


# Extending the Application

Now that we are able to initialize and configure our Flask application, it's time to start adding some more functionality. In this section we will add [middleware](https://en.wikipedia.org/wiki/Middleware) to handle proxy servers, implement logging for application errors, add custom HTTP error handlers, and finally integrate our database via [Flask-SQLAlchemy](http://flask-sqlalchemy.pocoo.org/).

Let's get started by first creating our `errors.py` and `extensions.py` files within the app module, as well as some error pages:

```bash
$ touch app/{errors,extensions}.py
$ mkdir -p app/templates/errors
$ touch app/templates/errors/{404,429,500}.html
```

We'll register our middleware next. In this example we will only be using the [ProxyFix](http://werkzeug.pocoo.org/docs/0.14/contrib/fixers/#werkzeug.contrib.fixers.ProxyFix) middleware class provided by [Werkzeug](http://werkzeug.pocoo.org/docs/0.14/), which is part of Flask. In short, this is a quick and simple way to give our application support for users behind HTTP proxies.

Opening up our `factory.py` file, we add the following import and function to include ProxyFix:

```python
from werkzeug.contrib.fixers import ProxyFix

def middleware(app):
    app.wsgi_app = ProxyFix(app.wsgi_app)
```

We will also create a function to create and register our application logger at this time:

```python
def logger(app):
    handler = logging.FileHandler(app.config['LOGGING_LOCATION'])
    handler.setLevel(app.config['LOGGING_LEVEL'])

    formatter = logging.Formatter(app.config['LOGGING_FORMAT'])
    handler.setFormatter(formatter)

    app.logger.addHandler(handler)
```

This function creates a file handler for our application's log file, sets its level, and creates a formatter, all using the Flask application's configuration values. We then register this handler with the Flask application's logger.

At this time we will update the `create_app` function to call the above two functions, registering the logger and middleware with our application:

```python
# SNIP

logger(app)
middleware(app)

return app
```

With the application logger and middleware configured and registered, it's time to tackle HTTP errors. This is accomplished by creating a function in which we iterate over a list of HTTP status codes, then applies an error handler for each status code with our application.

```python
from flask import render_template

def error_templates(app):
    def render_status(status):
        code = getattr(status, 'code', 500)
        return render_template('errors/{0}.html'.format(code)), code

    for error in [404, 429, 500]:
        app.errorhandler(error)(render_status)
```

This admittedly is not an optimal solution; if you have many HTTP status codes emitted by your application, you may want to consider using a more complex solution, such as a blueprint, instead. However, I have found this approach to be adequate for most purposes. At the very least, it's a starting point for a more elaborate solution.

The `error_templates` function iterates through a list of HTTP status codes, and for each creates a new error handler with our Flask application. The error will be handled by `render_status`, which attempts to retrieve the status code from the response, defaulting to 500, before rendering the appropriate error page.

With logging and error handling in place, it's finally time to integrate our database. As mentioned previously, we will be using [Flask-SQLAlchemy](http://flask-sqlalchemy.pocoo.org/) as our [Object Relational Mapper](https://en.wikipedia.org/wiki/Object-relational_mapping). This is built upon the mature and well documented SQLAlchemy package, which will map database records to Python objects, and vice versa.

Open `extensions.py`; this file exists primarily to avoid circular dependency problems that can occur with Flask. Create the database object:

```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
```

Then in `factory.py`, import the database object and create the `extensions` in which we register the database with our application:

```python
from app.extensions import db

def extensions(app):
    db.init_app(app)
```

Now we will import `error_templates` and call it along with `extensions` from within `create_app`:

```python
from app.errors import error_templates

# SNIP

logger(app)
middleware(app)

error_templates(app)

extensions(app)

return app
```


# Blueprints

Flask introduced the concepts of [blueprints](https://exploreflask.com/en/latest/blueprints.html) to aid in writing modular applications. Blueprints allow a developer to easily separate concerns, as well as create components that are reusable across applications. I am personally a huge fan of blueprints, and encourage their use whenever appropriate. For this example we will create a single, incredibly simple blueprint, purely for demonstrational purposes.

As usual, we'll begin by creating all required directories and files for this section:

```bash
$ mkdir -p app/blueprints/home
$ touch app/blueprints/__init__.py
$ touch app/blueprints/home/{__init__,views}.py
```

Now we'll define the blueprint. In our example, the **home** blueprint consists of a single endpoint, `/`, which will return the results of the `index` function:

```python
from flask import Blueprint

home_bp = Blueprint('home', __name__)

@home_bp.route('/')
def index():
    return 'Hello, world!'
```

While this next step is not required, I just find it helps keep imports a bit cleaner. This is purely preference, and can be skipped if you wish. We're importing the `home_bp` object into the root of the `blueprints` module, in `__init__.py`:

```python
from .home.views import home_bp
```

Now that we have created a blueprint, let's import it into `factory.py` and update `create_app` to register it with the application:

```python
from app.blueprints import home_bp

# SNIP

app.register_blueprint(home_bp)

extensions(app)

return app
```

Running our application with `flask run`, using `curl` to perform a GET request to `/` should return "Hello, world!".

```bash
$ curl localhost:5000/
Hello, world!
```


# Wrapping Up

The application skeleton we have created can serve as a platform for every Flask project we work on moving forward. This eliminates the need to constantly rewrite boilerplate, and allows us to get to coding as quickly as possible. I don't believe in *"one size fits all"* solutions, and I definitely don't claim that this is one of them. However, from my experience this is a solid foundation to grow from, and allows for clean, composable applications to be written quickly and effortlessly. It avoids some common pitfalls, and provides a predictable structure from which to expand your application's functionality.

Some of you may have noticed a glaring omission - *testing*. I find this differs far too much from person to person, and everybody seems to use a slightly different suite of tools and configuration. Additionally, testing web applications is a big topic, and is worthy of its own post. There is plenty of material written specifically on testing Flask applications, so I'd suggest hunting that down if this interests you. I may write more about this in the future.

As mentioned in the introduction, the full project can be found in the [jessebraham/flask_structure_example](https://github.com/jessebraham/flask_structure_example) repository on Github.
