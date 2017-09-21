# Jira Estimation Validator

The Jira `estimate-check` tool is a command line tool which queries Jira and reports the estimate and actual times for each issue. The actual times do not include weekends.

## Filter Issues Validated

You can filter what issues to query by providing a JQL search filter.

For example to query for only issues of a given sprint:

```
> estimate-check "Sprint = My_Team_IT122"
```
Make sure you use quotes if your query contains spaces.

## Authentication

The tool will use basic auth to connection to Jira.

When you first run the tool you will be asked to enter your user name and password for Jira. Good news when you enter your password we won't show it in the terminal :wink:

You will only be asked once as we'll save them to your home directory in the `.estimate-check` file. The next time you run the tool you won't be asked to enter credentials.

If you change your password you can flush the saved credentials by using the `--destroyconfig` flag.

```
> estimate-check "Sprint = My_Team_IT122" --destroyconfig
```

This will cause the tool to prompt you for your user name and password again.

## Output

The tool will print the results of the query to the terminal listing the issue ID and type, description, estimate, actual duration in days (not including weekends), and its current status.

By default it will print the info out in a human readable format; however, you can instruct the tool to output the data as a json string via the `--json` flag.

```
> estimate-check "Sprint = My_Team_IT122" --json
```

## Contributing

Bug reports and pull requests are welcome. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](https://contributor-covenant.org/) code of conduct.

The [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) is used for this project so you must comply to that rule set. You can verify your changes are in compliance via the `npm run lint` command.

## License

The tool is available as open source under the terms of the [ISC License](https://choosealicense.com/licenses/isc/).

## Compatible Jira Version

This tool has been developed and tested against Jira v7.2.7#72009-sha1:68b7d86