# Fastest AI Chat

The whole and sole motive of this project is to just understand why t3.chat is really fast and how it works. 
It was a fun thing to do, and I was very close when I found out that t3.chat is also using the APIs from azure cloud and not from OpenAI.

You can go through the codebase and understand how the streaming is implemented and to make sure things are kinda pure, 
so I am not using OpenAI SDK.

If you want to run it yourself, make sure to set the .env variables.

```bash
OPENAI_API_KEY="******"
OPENAI_PROJECT_ID="*********"
```


### How to run
```bash
$ bun install
$ bun run dev
```



