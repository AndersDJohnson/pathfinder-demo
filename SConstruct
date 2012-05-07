CSDIR = "./coffeescript/"
JSDIR = "./javascript/"
LESSDIR = "./styles/less"
CSSDIR = "./styles/css"

######

import os, fnmatch

def find( pattern, dir ):
	files = []
	for root, dirnames, filenames in os.walk(dir):
		for filename in fnmatch.filter(filenames, pattern):
			files.append(os.path.join(root, filename))
	return files

######

env = Environment()

CSFILES = find('*.coffee', CSDIR)

csBuild = 'coffee -c -o ' + JSDIR + ' $SOURCE'

for csFile in CSFILES:
	jsFile = csFile.replace('.coffee', '.js')
	jsFile = jsFile.replace(CSDIR, JSDIR)
	env.Command( jsFile, csFile, csBuild )

LESSFILES = find('*.less', LESSDIR)

print(LESSFILES)

lessBuild = '/home/anders/bin/lessc $SOURCE > $TARGET'

for lessFile in LESSFILES:
	basename = os.path.basename(lessFile)
	if basename[0] == '_':
		continue
	cssFile = lessFile.replace('.less', '.css')
	cssFile = cssFile.replace(LESSDIR, CSSDIR)
	env.Command( cssFile, lessFile, lessBuild )

