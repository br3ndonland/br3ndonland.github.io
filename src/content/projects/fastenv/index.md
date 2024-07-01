---
title: fastenv
dateStart: 2021-04-04
dateEnd: Present
description: ⚙️ Unified environment variable and settings management for FastAPI and beyond 🚀
image:
  src: "@images/fastenv-codesnap.png"
  alt: Screenshot of fastenv README
URLdocs: https://fastenv.bws.bio
URLrepo: https://github.com/br3ndonland/fastenv
---

## Description

fastenv <a href="https://en.wikipedia.org/wiki/Help:IPA/English" rel="external" target="_blank">[fæst iː ən v]</a> is a Python package for managing environment variables and application settings.

<a href="https://en.wikipedia.org/wiki/Environment_variable" rel="external" target="_blank">Environment variables</a> are key-value pairs provided to the operating system with syntax like `VARIABLE_NAME=value`. Collections of environment variables are stored in files commonly named _.env_ and called "dotenv" files. The <a href="https://docs.python.org/3/library/os.html" rel="external" target="_blank">Python standard library module <code>os</code></a> provides tools for reading and writing environment variables, but only handles strings, and doesn't include tools for file I/O. Additional logic is therefore needed to load environment variables from files before they can be read by Python, and to convert variables from strings to other Python types.

The initial motivation for building this package was to replace the aging, frustrating python-dotenv package. This package has many limitations, described in detail in the <a href="https://fastenv.bws.bio/comparisons#python-dotenv" rel="external" target="_blank">fastenv docs</a>. I attempted to contribute a <a href="https://github.com/theskumar/python-dotenv/pull/263" rel="external" target="_blank">fix</a> for one of these limitations. I went back and forth with the maintainer for over three months until they finally said they were not willing to consider the "breaking" (fixing) change in my contribution. Why didn't they say that in the first place? I didn't appreciate how the maintainer wasted so much of my time. I realized that, if I could write my own package in less than three months, it would be a better use of my time than working with python-dotenv. I did, and it was.

The first task was developing a data structure for environment variables, the `DotEnv` class.

## GitHub Copilot was not my copilot

I developed the `DotEnv` data structure in July 2021 during my Fourth of July vacation. The company I was at, [Intellia Therapeutics](/work/intellia), did company-wide "shutdown" weeks during which all employees got the week off. This was one such week. I enjoyed developing and testing `DotEnv` during this week. It was just pure Python data structures, and I had time to explore all the interesting things <a href="https://docs.python.org/3/library/stdtypes.html#mapping-types-dict" rel="external" target="_blank">Python mappings</a> can do.

I had just been admitted to the private beta of <a href="https://github.com/features/copilot/" rel="external" target="_blank">GitHub Copilot</a>, GitHub's AI assistant. The assistant was provided as an extension for the <a href="https://code.visualstudio.com/" rel="external" target="_blank">Visual Studio Code</a> ("VSCode") text editor I was using. I started with extension version `1.1.1940`. In those pre-GPT days, Copilot was based on the <a href="https://en.wikipedia.org/wiki/OpenAI_Codex" rel="external" target="_blank">Codex</a> model.

I've tried similar "AI" tools in the past. Microsoft offered a VSCode extension called <a href="https://web.archive.org/web/20200517225206/https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode" rel="external" target="_blank">IntelliCode</a> that I <a href="https://github.com/br3ndonland/dotfiles/commit/23f218acb19940315cc59a4e3c25775bb645345a" rel="external" target="_blank">tried</a> in 2020. It claimed to improve autocomplete suggestions beyond VSCode's built-in feature called <a href="https://code.visualstudio.com/docs/editor/intellisense" rel="external" target="_blank">IntelliSense</a>. It was useless. After IntelliCode, I tried TabNine, but it wasn't helpful either. When I <a href="https://github.com/br3ndonland/dotfiles/commit/941fa62f78462df379395f3ef20317ab656804e3" rel="external" target="_blank">uninstalled TabNine</a>, I started referring to each of these tools as "YAUAIT" ("Yet Another Useless AI Tool"). Would Copilot be YAUAIT?

I started trying to have Copilot help me with autocompletions and function generation. Initially, the autocompletions seemed to be somewhat helpful, and in one case, Copilot managed to fill in a unit test for me. I started by typing the function name and docstring (Copilot was hopeless at adding type annotations, so I did that part myself), and letting Copilot generate the function body. Here's how the function body looked when Copilot generated it:

```py
def test_iter(mocker: pytest_mock.MockerFixture) -> None:
    """Assert that calling the `__iter__` method on a
    `DotEnv` instance appropriately iterates over its keys.
    """
    mocker.patch.object(fastenv.dotenv, "os")
    example_dict = {"KEY1": "value1", "KEY2": "value2", "KEY3": "value3"}
    dotenv = fastenv.dotenv.DotEnv(**example_dict)
    assert list(dotenv) == list(example_dict.keys())
```

That was decent, but not entirely acceptable:

- The patching is overly broad. We don't need to patch over the entire `os` module, we just need to patch over its mapping of environment variables.
- The result of each iteration is not tested. The `__iter__` method is annotated with a parametrized iterator, `Iterator[str]`, meaning that each iteration should yield a string.

I ended up refactoring the test like this:

```py
def test_iter(mocker: pytest_mock.MockerFixture) -> None:
    """Assert that calling the `__iter__` method on a
    `DotEnv` instance appropriately iterates over its keys.
    """
    mocker.patch.dict(fastenv.dotenv.os.environ, clear=True)
    example_dict = {"KEY1": "value1", "KEY2": "value2", "KEY3": "value3"}
    dotenv = fastenv.dotenv.DotEnv(**example_dict)
    dotenv_iterator = iter(dotenv)
    assert list(dotenv) == list(example_dict.keys())
    for _ in example_dict:
        iteration_result = next(dotenv_iterator)
        assert iteration_result in example_dict
        assert isinstance(iteration_result, str)
    with pytest.raises(StopIteration):
        next(dotenv_iterator)
```

It also wrote another unit test with a number of issues. For this one, I just typed the function definition line (without a docstring), and let it generate the docstring and function body. The various issues are noted with `# inline comments`, with each comment referring to the line below it.

```py
# generated by GitHub Copilot (inline comments by @br3ndonland)
def test_delete_variable(mocker: pytest_mock.MockerFixture) -> None:
    """Assert that calling a `DotEnv` instance with variable keys deletes the
    corresponding variables from both the `DotEnv` instance and `os.environ`.
    """
    # should actually be patching os.environ, not the entire os module
    mocker.patch.object(fastenv.dotenv, "os")
    example_dict = {"KEY1": "value1", "KEY2": "value2", "KEY3": "value3"}
    dotenv = fastenv.dotenv.DotEnv(**example_dict)
    # not necessary, this is a test of deletes not gets
    assert dotenv(*example_dict.keys()) == example_dict
    # call to `keys()`, and this entire for loop, are not necessary
    for key in example_dict.keys():
        assert dotenv.get(key) == example_dict[key]
        assert dotenv.getenv(key, "not_set") == "not_set"
        assert dotenv[key] == example_dict[key]
        assert dotenv.get(key) == example_dict[key]
        assert dotenv.getenv(key, "not_set") == "not_set"
        assert dotenv[key] == example_dict[key]
    # Copilot hallucinated here. There was no `.delete()` method.
    # Should be `del dotenv[key]`.
    dotenv.delete(key)
    # call to keys() is not necessary
    for key in example_dict.keys():
        assert dotenv.get(key) is None
        assert dotenv.getenv(key, "not_set") == "not_set"
        assert dotenv[key] is None
        # the next three lines are duplicates of the previous three lines
        assert dotenv.get(key) is None
        assert dotenv.getenv(key, "not_set") == "not_set"
        assert dotenv[key] is None
        # missing `os.environ` assertions (`assert environ.get(key) is None`)
    assert len(dotenv) == 0
```

Here's how the problematic test ended up after I fixed it:

```py
# refactored by @br3ndonland
def test_delete_variable(mocker: pytest_mock.MockerFixture) -> None:
    """Assert that deleting a variable from a `DotEnv` instance deletes the
    corresponding variables from both the `DotEnv` instance and `os.environ`.
    """
    environ = mocker.patch.dict(fastenv.dotenv.os.environ, clear=True)
    example_dict = {"KEY1": "value1", "KEY2": "value2", "KEY3": "value3"}
    dotenv = fastenv.dotenv.DotEnv(**example_dict)
    for key in example_dict:
        del dotenv[key]
        assert dotenv.get(key) is None
        assert dotenv.getenv(key, "not_set") == "not_set"
        assert environ.get(key) is None
        with pytest.raises(KeyError):
            dotenv[key]
    assert len(dotenv) == 0
```

One potential reason for the issues in the problematic test may have been the auto-generated docstring. When GitHub Copilot mistakenly generated the part about "calling a `DotEnv` instance with variable keys," it may have told itself to add some of the unnecessary logic. The AI therefore may have consumed its own content (often called "dogfooding"), making its own error lead to another error. We're seeing this problem on the Internet at large. Large language models (LLMs) are generating content and then consuming their own content, leading some to suggest that "<a href="https://www.nytimes.com/2024/03/29/opinion/ai-internet-x-youtube.html" rel="external" target="_blank">A.I.-generated garbage</a>" is contributing to "<a href="https://www.theatlantic.com/technology/archive/2024/04/generative-ai-search-llmo/678154/" rel="external" target="_blank">the end of the web as we know it</a>."

I disabled Copilot and wrote the code myself.

## Connecting the cloud

The next challenge I tackled was integrating with <a href="https://en.wikipedia.org/wiki/Cloud_storage" rel="external" target="_blank">cloud object storage</a>. Object storage provides a virtual hard drive for storing "objects" (files) in the cloud. Dotenv files are commonly kept in cloud object storage, but environment variable management packages typically don't integrate with object storage clients. Additional logic is therefore required to download the files from object storage prior to loading environment variables. Why couldn't fastenv provide this capability?

I decided to built an object storage integration into fastenv. I also wanted to do it without depending on <a href="https://aws.amazon.com/sdk-for-python/" rel="external" target="_blank">Boto3, the AWS SDK for Python</a>. _Why not just use Boto3?_ I built an object storage client without Boto3 to make it:

- _Async_. fastenv can perform network requests and file I/O asynchronously, whereas Boto3's methods are synchronous.
- _Simple_. fastenv is a small, simple project that provides the necessary features without the bloat of Boto3. Why install all of Boto3 if you just need a few of the features? And if you actually want to understand what your code is doing, you can try sifting through Boto's packages and dynamically-generated objects, but wouldn't you rather just look at a few hundred lines of code right in front of you?
- _Type-annotated_. fastenv is fully type-annotated. Boto3 is not type-annotated. Its objects are dynamically generated at runtime using factory methods, making the code difficult to annotate and read.

Building this client requires:

- _Configuration_. The client needs to configure credentials and other information related to cloud object storage buckets. I wrote a simple configuration class for this purpose.
- _AWS Signature Version 4_. <a href="https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html" rel="external" target="_blank">AWS Signature Version 4</a> is the secret sauce that allows requests to flow through AWS services. I learned how it worked and wrote my own implementation of AWS Signature Version 4 to connect to AWS S3 and other S3-compatible platforms like <a href="https://www.backblaze.com/cloud-storage" rel="external" target="_blank">Backblaze B2</a>.
- _Object storage operations_. The client needs to be able to perform the appropriate network operations for downloading and uploading file objects. I implemented methods so that fastenv could download files with `GET`, and upload files with `PUT` or `POST`.

The <a href="https://fastenv.bws.bio/cloud-object-storage" rel="external" target="_blank">fastenv docs</a> have lots more details on how I implemented the object storage client.

## The future of fastenv

There are many more features I would like to add. See the <a href="https://github.com/br3ndonland/fastenv/discussions" rel="external" target="_blank">GitHub Discussions</a> for some ideas.
