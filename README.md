# CSV Row Multiplier

A small script that allows us to transfer values that are listed in one row to separate rows

The basic objective of this tool is to allow us to easily and quickly clean up big CSV files.

Using This Tool we can transform a CSV that looks like this:

| First Name | Last Name | Email           | State | Zip   | Phone 1        | Phone 2        | Interested |
| ---------- | --------- | --------------- | ----- | ----- | -------------- | -------------- | ---------- |
| John       | Mccain    | john@email.com  | NY    | 10001 | (123) 000-0000 | (123) 111-1111 | Yes        |
| Elton      | John      | elton@email.com | FL    | 10001 | (546) 000-0000 | (546) 111-1111 | No         |
| Bria       | Horton    | bria@email.com  | CA    | 10001 | (866) 000-0000 | (866) 111-1111 | Yes        |

To a CSV that looks like this:

| First Name | Last Name | City | Phone          |
| ---------- | --------- | ---- | -------------- |
| John       | Mccain    | NY   | (123) 000-0000 |
| John       | Mccain    | NY   | (123) 111-1111 |
| Elton      | John      | FL   | (546) 000-0000 |
| Elton      | John      | FL   | (546) 111-1111 |
| Bria       | Horton    | CA   | (866) 000-0000 |
| Bria       | Horton    | CA   | (866) 111-1111 |
