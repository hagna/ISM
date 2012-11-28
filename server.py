from twisted.web.server import Site, NOT_DONE_YET
from twisted.web.resource import Resource
from twisted.internet import reactor
from twisted.web.static import File
from twisted.internet import defer

from random import randint

import json

from jinja2 import Environment, FileSystemLoader

#---------------
# JINJA STUFF
#---------------
template_root = './'
jloader = FileSystemLoader(template_root, encoding='utf-8')
jenv = Environment(
    block_start_string='[[',
    block_end_string=']]',
    variable_start_string='[-',
    variable_end_string='-]',
    comment_start_string='[#',
    comment_end_string='#]',
    loader=jloader,
    extensions=[],
    cache_size=50,
)

jenv.globals['cssurl'] = '/css/'
jenv.globals['jsurl'] = '/js/'

def jrender(request, template_name, params=None):
    """
    Use Jinja to render a html file
    """
    if params is None:
        params = {}
    request.setHeader("content-type", "text/html")
    return jenv.get_template(template_name).render(params).encode('utf-8')



class MainResource(Resource):
    """
    Handles the root directory
    """
    def render_GET(self, request):
        return jrender(request, 'index.html')


class MenuItems(Resource):
    
    def render_GET(self, request):
        return json.dumps([
            {
                'name':'Dashboard',
                'action':'',
            },
            {
                'name':'Web0',
                'action':''
            },
            {
                'name':'Web1',
                'action':''
            },
            {
                'name':'Web2',
                'action':''
            }
        ])


class MiniWrap(Resource):
    def getChild(self, arg, request):
        if arg == '':
            return self
        return MiniViews(arg)

    def render_GET(self, request):
        web0 = {
            'id':'web0',
        }

        web1 = {
            'id':'web1',
        }

        web2 = {
            'id':'web2',
        }

        return json.dumps([
            web0,
            web1,
            web2,
        ])

        

class MiniViews(Resource):

    def __init__(self, sid):
        Resource.__init__(self)
        self.sid = sid

    def render_GET(self, request):
        print 'mini view'
        print self.sid
        mapper = {
            'web0':'Web0',
            'web1':'Web1',
            'web2':'Web2',
            'web3':'Web3'
        }

        webcrap = {
            'id':self.sid,
            'title':mapper[self.sid],
            'ram':randint(0, 32000),
            'ram_max':'32000',
            'connections':randint(0, 2000),
            'cpu':randint(0, 100)
        }
        return json.dumps(webcrap)

#URL HANDLING
root = Resource()
root.putChild('', MainResource())

js_resource = File('./static/js')
css_resource = File('./static/css')
img_resource = File('./static/img')
template_resource = File('./templates/')

#STATIC STUFF
root.putChild('js', js_resource)
root.putChild('css', css_resource)
root.putChild('img', img_resource)

# JS TEMPLATES
root.putChild('templates', template_resource)

#stuff
root.putChild("menu", MenuItems())
root.putChild("minis", MiniWrap())
root.putChild("servers", MiniWrap())

factory = Site(root)
reactor.listenTCP(8990, factory)
reactor.run()

