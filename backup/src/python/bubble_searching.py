import random
import math
import numpy
class Bubble(object):
    def __init__(self, x=10, y=10, radius=30, max=100, min=5, w=50, h=50):
        self.x = x
        self.y = y
        self.radius = radius
        self.r_growth = 5.0
        self.r_shrink = 5.0
        self.last_x = None
        self.last_y = None
        self.hits = 0
        self.winners = None
        self.valid_winners = None
        self.max = max
        self.min = min
        self.w = w
        self.h = h
    def __repr__(self):
        return str(self)
    def __str__(self):
        return "(x:{x}, y:{y}, r:{r}, hits:{hits})".format(x=self.x, y=self.y, r=self.radius, hits=self.hits)
    def __lt__(self, other):
        return (self.hits < other.hits or self.radius > other.radius)
    def position(self):
        a = random.random() * 2 * math.pi
        r = self.radius * math.sqrt(random.random())
        self.last_x = r * math.cos(a) + self.x
        if self.last_x > self.w:
            self.last_x = self.w
        elif self.last_x < 0.0:
            self.last_x = 0.0
        self.last_y = r * math.sin(a) + self.y
        if self.last_y > self.h:
            self.last_y = self.h
        elif self.last_y < 0.0:
            self.last_y = 0.0
        return self.last_x, self.last_y
    def update_valid_winners(self):
        self.valid_winners = self.winners[(((self.winners[:,0]-self.x)**2) + ((self.winners[:,1]-self.y)**2)) < (self.radius**2)]
    def grow(self):
        self.radius += self.r_growth
        if self.radius > self.max:
            self.radius = self.max
        sum = self.r_shrink + self.r_growth
        if sum < 0.1 or sum > self.max:
            self.r_shrink = 5.0
            self.r_growth = 5.0
        self.r_shrink *= 1.05
        self.r_growth *= 0.95
    def shrink(self):
        self.radius -= self.r_shrink
        if self.radius < self.min:
            self.radius = self.min
        sum = self.r_shrink + self.r_growth
        if sum < 0.1 or sum > self.max:
            self.r_shrink = 5.0
            self.r_growth = 5.0
        self.r_shrink *= 0.95
        self.r_growth *= 1.05
    def winner(self):
        self.hits += 1

        # This most likely was nothing if the points are the same.
        if self.x == self.last_x and self.y == self.last_y:
            self.grow()
        else:
            self.shrink()
        
        self.x = self.last_x
        self.y = self.last_y

        if self.winners is None:
            self.winners = numpy.array([[self.x, self.y]])
        else:
            self.winners = numpy.append(self.winners, [[self.x, self.y]], axis=0)
            self.update_valid_winners()
    def loser(self):
        self.grow()
        # Jump to a potential winner.
        if self.winners is not None:
            self.update_valid_winners()
            self.x, self.y = self.valid_winners[numpy.random.choice(len(self.valid_winners))]

class SearchSpace(object):
    def __init__(self, w=50, h=50, noise=0.2):
        self.w = w
        self.h = h
        self.noise = noise
        self.point = numpy.array([random.random()*w, random.random()*h])
    def __repr__(self):
        return str(self)
    def __str__(self):
        return "(x:{x}, y:{y})".format(x=self.point[0], y=self.point[1])
    def update(self):
        self.point += numpy.random.rand(2)*2 - 1.0
        if self.point[0] > self.w:
            self.point[0] = self.w
        elif self.point[0] < 0.0:
            self.point[0] = 0.0
        if self.point[1] > self.h:
            self.point[1] = self.h
        elif self.point[1] < 0.0:
            self.point[1] = 0.0
    def check(self, x, y):
        result = numpy.all(self.point == (x, y))
        if random.random() < self.noise:
            return not result
        return result

ss = SearchSpace()
bs = [Bubble(10,10), Bubble(40,40), Bubble(10,40), Bubble(40,10), Bubble(25,25)]

def run(search_space, bubbles, runs=10000):
    for i in range(runs):
        for bubble in bubbles:
            search_space.update()
            result = search_space.check(*bubble.position())
            if result:
                bubble.winner()
            else:
                bubble.loser()