#!/usr/bin/env bash
echo "sleep for 5, waiting for ldap"
sleep 5
ldapsearch -v -h openldap -x -D "cn=admin,dc=example,dc=org" -w admin -b "dc=example,dc=org" -s sub
echo "adding to ldap"
ldapadd -v -h openldap -c -D "cn=admin,dc=example,dc=org" -w admin -f /ldif_files/people.ldif
echo "done adding to ldap"
