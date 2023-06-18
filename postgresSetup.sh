#!/bin/bash

# If we can't run sudo without a password, complain and exit
if ! (sudo -n true 2> /dev/null)
then
    echo "please run as root" >&2
    echo "You need to enter password" >&2
fi

# If EUID isn't zero, replace and re-run this script as root using sudo.
if [ "$EUID" -ne 0 ]
then
        exec sudo bash "$0" "$@"
        echo "exec failed" >&2
        exit 1
fi

echo "Installing PostgresSQL"
sudo apt install postgresql -y

echo "Setting password of postgres user"
echo "=== $BASH_SOURCE on $(hostname -f) at $(date)" >&2
sudo passwd postgres

echo "Creating postgres user root"
sudo -u postgres createuser pi -P --interactive

echo "Starting Postgres"
sudo /etc/init.d/postgresql start

echo "Running psql and creating schema..."

sudo su - postgres -c \
"psql <<__END__

CREATE DATABASE pi;
CREATE DATABASE vocabdb;
\connect vocabdb;

--
-- PostgreSQL database dump
--

-- Dumped from database version 13.11 (Raspbian 13.11-0+deb11u1)
-- Dumped by pg_dump version 13.11 (Raspbian 13.11-0+deb11u1)

__END__
"

sudo -u postgres psql vocabdb < vocabdb.sql
sudo /etc/init.d/postgresql status
sudo netstat -tulntp | grep -i postgres