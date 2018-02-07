export const projects = [
  {
    'id': 3,
    'description': 'This is a test project.',
    'name': 'A-first-project',
    'name_with_namespace': 'Administrator / A-first-project',
    'path': 'A-first-project',
    'path_with_namespace': 'root/A-first-project',
    'created_at': '2018-02-02T15:12:23.034Z',
    'default_branch': null,
    'tag_list': [],
    'ssh_url_to_repo': 'git@localhost:root/A-first-project.git',
    'http_url_to_repo': 'http://localhost/root/A-first-project.git',
    'web_url': 'http://localhost/root/A-first-project',
    'avatar_url': null,
    'star_count': 0,
    'forks_count': 0,
    'last_activity_at': '2018-02-02T15:12:23.034Z',
    '_links': {
      'self': 'http://localhost/api/v4/projects/3',
      'issues': 'http://localhost/api/v4/projects/3/issues',
      'merge_requests': 'http://localhost/api/v4/projects/3/merge_requests',
      'repo_branches': 'http://localhost/api/v4/projects/3/repository/branches',
      'labels': 'http://localhost/api/v4/projects/3/labels',
      'events': 'http://localhost/api/v4/projects/3/events',
      'members': 'http://localhost/api/v4/projects/3/members'
    },
    'archived': false,
    'visibility': 'public',
    'owner': {
      'id': 1,
      'name': 'Administrator',
      'username': 'root',
      'state': 'active',
      'avatar_url': 'http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=80&d=identicon',
      'web_url': 'http://localhost/root'
    },
    'resolve_outdated_diff_discussions': false,
    'container_registry_enabled': true,
    'issues_enabled': true,
    'merge_requests_enabled': true,
    'wiki_enabled': true,
    'jobs_enabled': true,
    'snippets_enabled': true,
    'shared_runners_enabled': true,
    'lfs_enabled': true,
    'creator_id': 1,
    'namespace': {
      'id': 1,
      'name': 'root',
      'path': 'root',
      'kind': 'user',
      'full_path': 'root',
      'parent_id': null
    },
    'import_status': 'none',
    'open_issues_count': 0,
    'public_jobs': true,
    'ci_config_path': null,
    'shared_with_groups': [],
    'only_allow_merge_if_pipeline_succeeds': false,
    'request_access_enabled': false,
    'only_allow_merge_if_all_discussions_are_resolved': false,
    'printing_merge_request_link_enabled': true,
    'permissions': {
      'project_access': {
        'access_level': 40,
        'notification_level': 3
      },
      'group_access': null
    }
  },
  {
    'id': 2,
    'description': '',
    'name': 'A-second-project',
    'name_with_namespace': 'Administrator / A-second-project',
    'path': 'A-second-project',
    'path_with_namespace': 'root/A-second-project',
    'created_at': '2018-02-02T15:10:13.794Z',
    'default_branch': null,
    'tag_list': [],
    'ssh_url_to_repo': 'git@localhost:root/A-second-project.git',
    'http_url_to_repo': 'http://localhost/root/A-second-project.git',
    'web_url': 'http://localhost/root/A-second-project',
    'avatar_url': null,
    'star_count': 0,
    'forks_count': 0,
    'last_activity_at': '2018-02-02T15:10:13.794Z',
    '_links': {
      'self': 'http://localhost/api/v4/projects/2',
      'issues': 'http://localhost/api/v4/projects/2/issues',
      'merge_requests': 'http://localhost/api/v4/projects/2/merge_requests',
      'repo_branches': 'http://localhost/api/v4/projects/2/repository/branches',
      'labels': 'http://localhost/api/v4/projects/2/labels',
      'events': 'http://localhost/api/v4/projects/2/events',
      'members': 'http://localhost/api/v4/projects/2/members'
    },
    'archived': false,
    'visibility': 'private',
    'owner': {
      'id': 1,
      'name': 'Administrator',
      'username': 'root',
      'state': 'active',
      'avatar_url': 'http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=80&d=identicon',
      'web_url': 'http://localhost/root'
    },
    'resolve_outdated_diff_discussions': false,
    'container_registry_enabled': true,
    'issues_enabled': true,
    'merge_requests_enabled': true,
    'wiki_enabled': true,
    'jobs_enabled': true,
    'snippets_enabled': true,
    'shared_runners_enabled': true,
    'lfs_enabled': true,
    'creator_id': 1,
    'namespace': {
      'id': 1,
      'name': 'root',
      'path': 'root',
      'kind': 'user',
      'full_path': 'root',
      'parent_id': null
    },
    'import_status': 'none',
    'open_issues_count': 0,
    'public_jobs': true,
    'ci_config_path': null,
    'shared_with_groups': [],
    'only_allow_merge_if_pipeline_succeeds': false,
    'request_access_enabled': false,
    'only_allow_merge_if_all_discussions_are_resolved': false,
    'printing_merge_request_link_enabled': true,
    'permissions': {
      'project_access': {
        'access_level': 40,
        'notification_level': 3
      },
      'group_access': null
    }
  }
];

export const projectReadme = '# Project Title' +
  'One Paragraph of project description goes here' +
  '## Getting Started' +
  'These instructions will get you a copy of the project up and running on your local machine for development' +
  'and testing purposes. See deployment for notes on how to deploy the project on a live system.' +
  '### Prerequisites' +
  'What things you need to install the software and how to install them' +
  '```' +
  'Give examples' +
  '```' +
  '### Installing' +
  'A step by step series of examples that tell you have to get a development env running';


/* eslint-disable */
const notebookObject = {"cells":[{"cell_type":"code","execution_count":21,"metadata":{},"outputs":[{"data":{"text/html":["<div>\n","<style scoped>\n","    .dataframe tbody tr th:only-of-type {\n","        vertical-align: middle;\n","    }\n","\n","    .dataframe tbody tr th {\n","        vertical-align: top;\n","    }\n","\n","    .dataframe thead th {\n","        text-align: right;\n","    }\n","</style>\n","<table border=\"1\" class=\"dataframe\">\n","  <thead>\n","    <tr style=\"text-align: right;\">\n","      <th></th>\n","      <th>Year</th>\n","      <th>Month</th>\n","      <th>Temperature</th>\n","      <th>Precipitation</th>\n","    </tr>\n","  </thead>\n","  <tbody>\n","    <tr>\n","      <th>0</th>\n","      <td>1864</td>\n","      <td>1</td>\n","      <td>-6.6</td>\n","      <td>25.7</td>\n","    </tr>\n","    <tr>\n","      <th>1</th>\n","      <td>1864</td>\n","      <td>2</td>\n","      <td>-1.5</td>\n","      <td>32.9</td>\n","    </tr>\n","    <tr>\n","      <th>2</th>\n","      <td>1864</td>\n","      <td>3</td>\n","      <td>4.5</td>\n","      <td>51.0</td>\n","    </tr>\n","    <tr>\n","      <th>3</th>\n","      <td>1864</td>\n","      <td>4</td>\n","      <td>6.8</td>\n","      <td>46.9</td>\n","    </tr>\n","    <tr>\n","      <th>4</th>\n","      <td>1864</td>\n","      <td>5</td>\n","      <td>12.3</td>\n","      <td>78.4</td>\n","    </tr>\n","  </tbody>\n","</table>\n","</div>"],"text/plain":["   Year  Month  Temperature  Precipitation\n","0  1864      1         -6.6           25.7\n","1  1864      2         -1.5           32.9\n","2  1864      3          4.5           51.0\n","3  1864      4          6.8           46.9\n","4  1864      5         12.3           78.4"]},"execution_count":21,"metadata":{},"output_type":"execute_result"}],"source":["df = weather_ch.read_data('../data/homog_mo_SMA.txt')\n","df.head()"]},{"cell_type":"markdown","metadata":{},"source":["# Convert temperature to deviation from a reference"]},{"cell_type":"code","execution_count":23,"metadata":{},"outputs":[{"data":{"text/html":["<div>\n","<style scoped>\n","    .dataframe tbody tr th:only-of-type {\n","        vertical-align: middle;\n","    }\n","\n","    .dataframe tbody tr th {\n","        vertical-align: top;\n","    }\n","\n","    .dataframe thead th {\n","        text-align: right;\n","    }\n","</style>\n","<table border=\"1\" class=\"dataframe\">\n","  <thead>\n","    <tr style=\"text-align: right;\">\n","      <th></th>\n","      <th>Year</th>\n","      <th>Temperature</th>\n","    </tr>\n","  </thead>\n","  <tbody>\n","    <tr>\n","      <th>0</th>\n","      <td>1981</td>\n","      <td>1.25</td>\n","    </tr>\n","    <tr>\n","      <th>1</th>\n","      <td>1982</td>\n","      <td>0.15</td>\n","    </tr>\n","    <tr>\n","      <th>2</th>\n","      <td>1983</td>\n","      <td>1.30</td>\n","    </tr>\n","    <tr>\n","      <th>3</th>\n","      <td>1984</td>\n","      <td>0.40</td>\n","    </tr>\n","    <tr>\n","      <th>4</th>\n","      <td>1985</td>\n","      <td>0.95</td>\n","    </tr>\n","  </tbody>\n","</table>\n","</div>"],"text/plain":["   Year  Temperature\n","0  1981         1.25\n","1  1982         0.15\n","2  1983         1.30\n","3  1984         0.40\n","4  1985         0.95"]},"execution_count":23,"metadata":{},"output_type":"execute_result"}],"source":["tdf.head()"]},{"cell_type":"code","execution_count":5,"metadata":{},"outputs":[{"data":{"text/plain":["<matplotlib.axes._subplots.AxesSubplot at 0x1017e8780>"]},"execution_count":5,"metadata":{},"output_type":"execute_result"},{"data":{"image/png":"iVBORw0KGgoAAAANSUhEUgAAAWsAAAD0CAYAAABdAQdaAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz\nAAALEgAACxIB0t1+/AAAADl0RVh0U29mdHdhcmUAbWF0cGxvdGxpYiB2ZXJzaW9uIDIuMS4wLCBo\ndHRwOi8vbWF0cGxvdGxpYi5vcmcvpW3flQAAD7VJREFUeJzt3X9IVYf/x/HX9d6y9Cb3j2QErdZa\nY2TIFq3aH7mg7EZfGsVqrcIoY4wI6oIz7WK/ZrOiuViSFQ5iVKMfG4SwETQphGoSgxo5WgRtrB9s\n9ofotaGm5/NH37l+2NVu93h86/Px17zp8eU6PTvdzk2f4ziOAAD9WorXAwAAPSPWAGAAsQYAA4g1\nABhArAHAAGINAAYE3DpwQ0OzK8cNBlMVi7W6cmy3sLlvsLlvsNldmZkjun3c3JV1IOD3esJzY3Pf\nYHPfYLM3zMUaAAYjYg0ABhBrADCAWAOAAcQaAAwg1gBgALEGAAOINQAY4NorGIGevF1e68nnvVSQ\n48nnBV4EV9YAYACxBgADiDUAGECsAcAAYg0ABhBrADCAW/eAPsTtikgUV9YAYACxBgADenwapKOj\nQyUlJbp586Z8Pp+2bdum1NRUFRcXy+fzacKECdqyZYtSUug+ALilx1ifPXtWknTs2DHV1dVpz549\nchxHkUhE06ZN0+bNm1VTU6Pc3FzXxwLAYNXj5fDs2bNVWloqSbpz544yMjJUX1+vqVOnSpJycnJ0\n4cIFd1cCwCDXq7tBAoGAioqKdObMGe3du1fnz5+Xz+eTJKWnp6u5ufmpjwkGU135jsJ+f4pCobSk\nH9dNbO5fBurXFU8yv2aL54bFzU/q9a17u3bt0ieffKIPPvhAra2tXY+3tLQoIyPjqfePxVqfeiwZ\nQqE0NTbed+XYbmFz/zJQv654kvk1Wzw3LG3OzBzR7eM9Pg1y6tQpHTx4UJI0fPhw+Xw+TZo0SXV1\ndZKk2tpaTZkyJYlTAQBP6vHKes6cOdq4caOWL1+uBw8eKBqNavz48dq0aZO++OILvfrqqwqHw32x\nFQAGrR5jnZaWpi+//PKpx48cOeLKIADA07g5GgAMINYAYACxBgADiDUAGECsAcAAYg0ABhBrADCA\nWAOAAcQaAAwg1gBgALEGAAOINQAYQKwBwABiDQAGEGsAMIBYA4ABxBoADCDWAGAAsQYAA4g1ABhA\nrAHAAGINAAYQawAwgFgDgAGBeD/Y3t6uaDSq27dvq62tTWvWrNGoUaP08ccf65VXXpEkLV26VPPm\nzeuLrQAwaMWNdXV1tUKhkHbv3q3GxkYtWLBAa9eu1apVq5Sfn99XGwFg0Isb67lz5yocDkuSHMeR\n3+/X1atXdfPmTdXU1Gjs2LGKRqMKBoN9MhYABqu4z1mnp6crGAwqFotp3bp1ikQiys7O1oYNG3T0\n6FG9/PLL2rdvX19tBYBBK+6VtSTdvXtXa9eu1bJlyzR//nw1NTUpIyNDkpSbm6vS0tJuPy4YTFUg\n4E/uWkl+f4pCobSkH9dNbO5f3i6v9XpCn0vmz6XFc8Pi5ifFjfW9e/eUn5+vzZs365133pEkrV69\nWps2bVJ2drYuXryorKysbj82FmtN/lo9POkaG++7cmy3sBleS+bPpcVzw9LmzMwR3T4eN9YHDhxQ\nU1OTKisrVVlZKUkqLi5WWVmZhgwZopEjRz7zyhoAkDw+x3EcNw7c0NDsxmFN/Q75LzZ3bzA+HeGV\nSwU5STsW57O7nnVlzYtiAMAAYg0ABhBrADCAWAOAAcQaAAwg1gBgALEGAAOINQAYQKwBwABiDQAG\nEGsAMIBYA4ABxBoADCDWAGAAsQYAA3r8tl4Y2Pg3pQEbuLIGAAOINQAYQKwBwABiDQAGEGsAMIBY\nA4ABxBoADCDWAGAAsQYAA+K+grG9vV3RaFS3b99WW1ub1qxZo9dee03FxcXy+XyaMGGCtmzZopQU\nmg8Aboob6+rqaoVCIe3evVuNjY1asGCB3njjDUUiEU2bNk2bN29WTU2NcnNz+2ovAAxKcS+J586d\nq/Xr10uSHMeR3+9XfX29pk6dKknKycnRhQsX3F8JAINc3Cvr9PR0SVIsFtO6desUiUS0a9cu+Xy+\nrh9vbm7u9mODwVQFAv4kz5X8/hSFQmlJP66bLG7GwJLM88/i+Wxx85N6/Ff37t69q7Vr12rZsmWa\nP3++du/e3fVjLS0tysjI6PbjYrHW5K18RCiUpsbG+64c2y0WN2NgSeb5Z/F8trQ5M3NEt4/HfRrk\n3r17ys/PV2FhoRYtWiRJmjhxourq6iRJtbW1mjJlSpKnAgCeFDfWBw4cUFNTkyorK5WXl6e8vDxF\nIhFVVFRoyZIlam9vVzgc7qutADBo+RzHcdw4cEND989lvyhLf5z5V3/ezDcfGBwuFeQk7Vj9+Xx+\nFkubE3oaBADQPxBrADCAWAOAAcQaAAwg1gBgALEGAAOINQAYQKwBwABiDQAGEGsAMIBYA4ABxBoA\nDCDWAGAAsQYAA4g1ABhArAHAAGINAAYQawAwgFgDgAHEGgAMINYAYACxBgADiDUAGECsAcCAXsX6\nypUrysvLkyT9+uuvmjFjhvLy8pSXl6cffvjB1YEAACnQ0ztUVVWpurpaw4cPlyTV19dr1apVys/P\nd30cAOChHq+sx4wZo4qKiq63r169qnPnzmn58uWKRqOKxWKuDgQA9OLKOhwO69atW11vZ2dna/Hi\nxZo0aZL279+vffv2qaio6KmPCwZTFQj4k7tWkt+folAoLenHdZPFzRhYknn+WTyfLW5+Uo+xflJu\nbq4yMjK6/ru0tLTb94vFWl9s2TOEQmlqbLzvyrHdYnEzBpZknn8Wz2dLmzMzR3T7+HPfDbJ69Wr9\n8ssvkqSLFy8qKyvrxZYBAHr03FfWW7duVWlpqYYMGaKRI0c+88oaAJA8vYr16NGjdeLECUlSVlaW\njh075uooAMDjeFEMABhArAHAAGINAAYQawAwgFgDgAHEGgAMINYAYACxBgADnvsVjADsebu81rPP\nfakgx7PPPZBwZQ0ABhBrADCAWAOAAcQaAAwg1gBgALEGAAOINQAYQKwBwABiDQAGEGsAMIBYA4AB\nxBoADOAfcuonvPyHdgD0f1xZA4ABxBoADOhVrK9cuaK8vDxJ0h9//KGlS5dq2bJl2rJlizo7O10d\nCADoRayrqqpUUlKi1tZWSdKOHTsUiUT0zTffyHEc1dTUuD4SAAa7HmM9ZswYVVRUdL1dX1+vqVOn\nSpJycnJ04cIF99YBACT1ItbhcFiBwH83jTiOI5/PJ0lKT09Xc3Oze+sAAJISuHUvJeW/vre0tCgj\nI6Pb9wsGUxUI+BNf9gx+f4pCobSkH9dNFjcDydIfzv2B8GvwuWM9ceJE1dXVadq0aaqtrdX06dO7\nfb9YrPWFx3UnFEpTY+N9V47tFoubgWTpD+e+pV+DmZkjun38uW/dKyoqUkVFhZYsWaL29naFw+EX\nHgcAiK9XV9ajR4/WiRMnJEnjxo3TkSNHXB0FAHgcL4oBAAOINQAYQKwBwABiDQAGEGsAMIBYA4AB\nxBoADCDWAGAAsQYAA/gejABc5dX3F71UkOPJ53ULV9YAYACxBgADiDUAGECsAcAAYg0ABnA3yCO8\n+ltrAOgJV9YAYACxBgADiDUAGECsAcAAYg0ABhBrADCAWAOAAcQaAAwg1gBgQMKvYFy4cKGCwaAk\nafTo0dqxY0fSRgEAHpdQrFtbW+U4jg4fPpzsPQCAbiT0NMi1a9f0zz//KD8/XytWrNDly5eTvQsA\n8IiErqyHDRum1atXa/Hixfr999/10Ucf6fTp0woE/jtcMJiqQMCftKH/8vtTFAqlJf24AAaWRzsx\nELqRUKzHjRunsWPHyufzady4cQqFQmpoaNCoUaO63icWa03ayEeFQmlqbLzvyrEBDByPdsJSNzIz\nR3T7eEJPg3z77bfauXOnJOmvv/5SLBZTZmZm4usAAHEldGW9aNEibdy4UUuXLpXP51NZWdljT4EA\nAJIrocIOHTpU5eXlyd4CAHgGXhQDAAbw3AWAAcmrb9N3qSDHleNyZQ0ABhBrADCAWAOAAcQaAAwg\n1gBgALEGAAOINQAYQKwBwABiDQAGEGsAMIBYA4ABxBoADCDWAGAAsQYAA4g1ABhArAHAAGINAAYQ\nawAwgFgDgAH98nswevW90wCgv+LKGgAMINYAYEBCT4N0dnZq69at+u233zR06FBt375dY8eOTfY2\nAMD/S+jK+scff1RbW5uOHz+ugoIC7dy5M9m7AACPSCjWP//8s2bMmCFJevPNN3X16tWkjgIAPC6h\np0FisZiCwWDX236/Xw8ePFAg8N/hMjNHJDzq953/l/DHAsBAlNCVdTAYVEtLS9fbnZ2dj4UaAJBc\nCcV68uTJqq19eC/05cuX9frrryd1FADgcT7HcZzn/aB/7wa5fv26HMdRWVmZxo8f78Y+AIASjLWX\n7t+/r4KCAjU1NWnIkCHatWuXXnrpJa9nxdXc3KzCwkLFYjG1t7eruLhYb731ltezeuXMmTM6ffq0\nysvLvZ7yTFZvJb1y5Yo+//xzHT582OspvdLe3q5oNKrbt2+rra1Na9as0axZs7yeFVdHR4dKSkp0\n8+ZN+Xw+bdu2zewzAeZeFHPixAllZWXp6NGjeu+991RVVeX1pB4dOnRI06dP15EjR7Rjxw59+umn\nXk/qle3bt6u8vFydnZ1eT4nL4q2kVVVVKikpUWtrq9dTeq26ulqhUEjffPONvvrqK5WWlno9qUdn\nz56VJB07dkyRSER79uzxeFHizP2t4MqVK9XR0SFJunPnjjIyMjxe1LOVK1dq6NChkh7+Tp+amurx\not6ZPHmyZs+erePHj3s9JS6Lt5KOGTNGFRUV2rBhg9dTem3u3LkKh8OSJMdx5Pf7PV7Us9mzZ2vm\nzJmS7PTiWfp1rE+ePKmvv/76scfKysqUnZ2tFStW6Pr16zp06JBH67oXb3NDQ4MKCwsVjUY9Wte9\nZ22eN2+e6urqPFrVe725lbS/CYfDunXrltcznkt6erqkh/+/161bp0gk4vGi3gkEAioqKtKZM2e0\nd+9er+ckzjHsxo0bzqxZs7ye0SvXrl1z5s2b55w7d87rKc/lp59+ciKRiNcz4iorK3O+//77rrdn\nzJjh4Zre+/PPP53Fixd7PeO53Llzx1m4cKFz8uRJr6c8t7///tuZOXOm09LS4vWUhJh7zvrgwYM6\ndeqUpIe/01v4o9iNGze0fv16lZeX69133/V6zoDDraR94969e8rPz1dhYaEWLVrk9ZxeOXXqlA4e\nPChJGj58uHw+n1JSzGVPUj9/GqQ777//voqKivTdd9+po6NDZWVlXk/qUXl5udra2vTZZ59Jevii\nov3793u8auDIzc3V+fPn9eGHH3bdSorkO3DggJqamlRZWanKykpJD/+idNiwYR4ve7Y5c+Zo48aN\nWr58uR48eKBoNNqv98Zj7tY9ABiMbP55AAAGGWINAAYQawAwgFgDgAHEGgAMINYAYACxBgADiDUA\nGPA/1gl2ihXNlaQAAAAASUVORK5CYII=\n","text/plain":["<matplotlib.figure.Figure at 0x10180c908>"]},"metadata":{},"output_type":"display_data"}],"source":["normal_yearly_temp_ser.hist()"]}],"metadata":{"kernelspec":{"display_name":"Python 3","language":"python","name":"python3"},"language_info":{"codemirror_mode":{"name":"ipython","version":3},"file_extension":".py","mimetype":"text/x-python","name":"python","nbconvert_exporter":"python","pygments_lexer":"ipython3","version":"3.6.3"}},"nbformat":4,"nbformat_minor":2};
export const projectNotebookFile = JSON.stringify(notebookObject);
