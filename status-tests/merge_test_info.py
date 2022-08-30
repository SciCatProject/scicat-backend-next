#!/bin/python3
#

# merge test output with test endpoints
# Max Novelli


import os
import pandas as pd
import re

re_separator = re.compile(" *\| *")

#
# load info from the two md files
with open("tests-status.md","r") as fh:
    lines = fh.readlines()

#print("=>" + re_separator.sub("|",lines[2]).strip() + "<=")
dfStatus = pd.DataFrame([re_separator.sub("|",l).strip().split("|") for l in lines[2:]]).drop(columns=[0,4])
dfStatus.columns=["Section","Test","Status"]

#print(dfStatus.columns)
#print(dfStatus.head())


#
# load info from the two md files
with open("tests-endpoints.md","r") as fh:
    lines = fh.readlines()

dfEndpoints = pd.DataFrame([re_separator.sub("|",l).strip().split("|") for l in lines]).drop(columns=[0,6])
dfEndpoints.columns = ["Test file","Section","Test","Predicate","Endpoint"]
dfEndpoints = dfEndpoints[dfEndpoints['Test'] != 'unknown']

#print(dfEndpoints.head())

#print(dfStatus[dfStatus["Test"] == "adds a new proposal"])
#print(dfEndpoints[dfEndpoints["Test"] == "adds a new proposal"])
#print(dfEndpoints[dfEndpoints["Section"] == "RawDatasets"])

dfComplete = pd.merge(dfStatus,dfEndpoints,how='outer',left_on=["Section","Test"],right_on=["Section","Test"])
#print(dfComplete.head())

dfComplete.to_markdown("migration-status.md")
dfComplete.to_html("migration-status.html")
