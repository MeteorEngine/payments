`meteor add meteorengine:payments`

###Adding your Stripe publishable and secret key

*The following is common sense, but in case you don't know or are new to programming*


#####Option 1:

The absolute recommended way of adding your Stripe keys is to add it via environment variables.


######For development:

Write this into your `settings.json` file

```json
{
  "public" : {
    "stripe": {
      "publishableKey": "abc123"      
    }
  },
  "stripe": {
    "secretKey": "abc123"
  }
}
```

Launch meteor: `meteor --settings settings.json`

######For production:

- Using [mup]() is self-explanatory

- 

#####Option 2:

A less secure way is to just use the form provided by this package.*

To use this option do not set any stripe values in your `Meteor.settings.public.stripe` or
`Meteor.settings.stripe` variables


* When setting the keys via this package, it is creating a `config.json` file in project root.
Which if you are not careful when committing your project to a **public** repository (Definitely not recommended),
bots can sniff out keys and then malicious people can do ... malicious things.

######Option 3:
Probably the easiest option is to