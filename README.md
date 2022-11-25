# vocab-feeder

## A React app that I can use as my one-stop note hub for studying language (in my case, Dutch)

When it comes to learning and studying languages, I tend to hate most of the tools that I find. Whether it's their UX, their structure, the modularized purpose of that particular app, their subscription model... whatever it may be, there's almost always something that annoys me in some form.

So I'm doing something about it!

vocab-feeder is an ongoing project that I use to build out my language learning ideas. It started off as me wanting a "word of the day" tool that I had more control over: noting when I've mastered concepts, updating batches, etc...

So I wrote a Slack integration, threw it on a cronjob, and added a manual trigger in VF!

Then, I needed a better flashcard system. Quizlet is getting too bulky (and subscribe-y) for my tastes. Anki has always felt a bit limited and manual. So I figured it could be a good exercise to build my own version.

Now it's the Review tab! I set up the data (which is something you have to do with flashcard apps usually anyways), categorized it, and set up a reviewing system that supports both card by card review, and category-based testing.

Next, I really needed a way to organize my class notes. I have a chaotic notebook of lesson notes that have little organization. 

Outcome: a Notes tab!

That's the overview: when I think something would be handy, and I don't want to have to trek all over the place to organize it, it's going into the app!

## Technology
App is intended to run on a dedicated machine 24/7 (I use an rPi as it doesn't need to be compute intensive). Backend is PostgreSQL and Node, frontend is React.

I mostly chose this stack because I wanted to learn more about it.

## Installing and Running
Currently, a lot of steps are required for initial setup (build script hasn't been completed yet).

This will stay a TODO until the complicated parts have been refactored into a setup script (tables and columns have to be manually configured, as does an env file)
