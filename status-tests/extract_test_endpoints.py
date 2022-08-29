#!/bin/python3
#
# this script extract the endpoint used by tests
# Max Novelli

import os
import re

# test folders
test_folder = os.path.abspath("../test")
#print("Tests folder : " + test_folder);

# initialize variables
section="unknown"
test="unknown"
predicate="unknown"
endpoint="unknown"

# prepare the reg exp
re_section = re.compile("^describe\([\"\'](.+)[\"\']\, ")
re_test = re.compile("^ +it\([\"\'](.+)[\"\']\, ")
#re_endpoint = re.compile("^ +\.(post|get|delete)\([\"\'\`](.+)[\"\'\`]\)")
re_endpoint = re.compile("^ +\.(post|get|delete|put|patch)\((.+)[\),]")

re_dataset1 = re.compile("<pid[12]*>|<.+\.datasetId>|<pidraw>|<pidderived>")
re_datablock1 = re.compile("<idDatablock[12]*>")
re_origdatablock1 = re.compile("<idOrigDatablock[12]*>|<item\.id>")
re_proposal1 = re.compile("<item\.proposalId>")

url_convert = {
    "pid": "<pid>",
    "attachemendId" : "<attachement_id>",
    "proposalId" : "<proposal_id>"
}


def prep_endpoint(v):
    if v[0] == '"' and v[-1] == '"':
        v = v[1:-1]
    elif v[0] == '`' and v[-1] == '`':
        v = v[1:-1]
    else:
        v = "<" + v + ">"
    return v.replace("${","<",5).replace("}",">",5)


# list all the test files
for f in os.listdir(test_folder):
    ffp = os.path.join(test_folder,f)
#    print("Processing file : " + ffp)

    # read file content
    with open(ffp,'r') as fh:
        # initialize variables
        section="unknown"
        test="unknown"
        predicate="unknown"
        endpoint="unknown"

        for l in fh.readlines():
            # discard lines with comments
            if l.startswith('//'):
                continue

#            print(l)
            # check if we have a line with section, test or endpoint
            s = re_section.search(l)
            if s:
#                print("Section found")
                section = s.group(1)

            else:
                s = re_test.search(l)
                if s:
#                    print("Test found")
                    test = s.group(1)
                else:
                    s = re_endpoint.search(l)
                    if s:
                        predicate = s.group(1)
                        endpoint = s.group(2)

                        #t1 = [i.strip() for i in endpoint.split("?")[0].split("+")]
                        t1 = [i.strip() for i in endpoint.split("+")]
                        #t1 = [ url_convert[i] if i in url_convert.keys() else i for i in t1 ]
                        t1 = [ prep_endpoint(i) for i in t1 ]
                        t2 = "".join(t1).split('?')[0]
                        t2 = re_dataset1.sub("<datasetPid>",t2)
                        t2 = re_datablock1.sub("<datablockId>",t2)
                        t2 = re_origdatablock1.sub("<origDatablockId>",t2)
                        t2 = re_proposal1.sub("<proposalId>",t2)
                        t2 = t2.replace("<","_").replace(">","_")

                        print(f"| {f} | {section} | {test} | {predicate} | {t2} |")


#    break
