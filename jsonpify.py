import os
import sys

DATA_CALLBACK = 'boilerdata'
TEMPLATE_CALLBACK = 'boilertemplate'
OUTPUT_DIR = 'jsonp'

#--------- Javascript escaping code lifted from Django (BSD)
_base_js_escapes = (
    ('\\', r'\u005C'),
    ('\'', r'\u0027'),
    ('"', r'\u0022'),
    ('>', r'\u003E'),
    ('<', r'\u003C'),
    ('&', r'\u0026'),
    ('=', r'\u003D'),
    ('-', r'\u002D'),
    (';', r'\u003B'),
    (u'\u2028', r'\u2028'),
    (u'\u2029', r'\u2029')
)

# Escape every ASCII character with a value less than 32.
_js_escapes = (_base_js_escapes +
               tuple([('%c' % z, '\\u%04X' % z) for z in range(32)]))

def escapejs(value):
    """Hex encodes characters for use in JavaScript strings."""
    for bad, good in _js_escapes:
        value = value.replace(bad, good)
    return value
#-------- End filching

for filename in os.listdir('templates'):
    with open('templates/%s' % filename, 'r') as f:
        content = f.read()
    
    content = escapejs(content)
    output = '%s("%s")' % (TEMPLATE_CALLBACK, content)
    
    outfile = ''
    
    with open('%s/%s' % (OUTPUT_DIR, filename), 'w') as f:
        f.write(output)
    
for filename in os.listdir('data'):
    with open('data/%s' % filename, 'r') as f:
        content = f.read()

    if filename.endswith('.csv'):
        content = '"%s"' % escapejs(content)
        
    output = '%s(%s)' % (DATA_CALLBACK, content)
    
    with open('%s/%s' % (OUTPUT_DIR, filename), 'w') as f:
        f.write(output)